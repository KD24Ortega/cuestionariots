import { useEffect, useMemo, useState } from "react";
import { parsePreguntas, type Pregunta } from "./lib/questions";
import { shuffleInPlace } from "./lib/shuffle";
import { loadHistoryState, saveHistoryState, pushAttempt, createId, hashStringDjb2 } from "./lib/quizHistory";
import { pathToScreen, screenToPath } from "./lib/quizRouting";
import type { Choice, Feedback, HistoryStateV2, Label, Mode, QuizAttempt, QuizSource, RevealMode, Screen, Theme } from "./lib/quizTypes";
import { QuizHeader } from "./components/quiz/QuizHeader";
import { MenuScreen } from "./components/quiz/screens/MenuScreen";
import { ExitScreen } from "./components/quiz/screens/ExitScreen";
import { SetupScreen } from "./components/quiz/screens/SetupScreen";
import { HistoryScreen } from "./components/quiz/screens/HistoryScreen";
import { ReviewScreen } from "./components/quiz/screens/ReviewScreen";
import { EmptyQuizScreen } from "./components/quiz/screens/EmptyQuizScreen";
import { QuizScreen } from "./components/quiz/screens/QuizScreen";
import { ResultScreen } from "./components/quiz/screens/ResultScreen";

const THEME_KEY = "quizpwa.theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function buildChoices(p: Pregunta): Choice[] {
  const base: Choice[] = (["A", "B", "C", "D"] as const).map((lab, idx) => ({
    label: lab,
    text: p.opciones[idx],
    originalLabel: lab
  }));
  shuffleInPlace(base);
  return base.map((c, idx) => ({ ...c, label: (["A", "B", "C", "D"] as const)[idx] }));
}

export function QuizApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("all");
  const [revealMode, setRevealMode] = useState<RevealMode>("instant");
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [fileName, setFileName] = useState<string | null>(null);
  const [hideSetupFilePicker, setHideSetupFilePicker] = useState(false);

  const [history, setHistory] = useState<HistoryStateV2<Pregunta>>(() => {
    if (typeof window === "undefined") return { v: 2, sources: {}, attempts: [] };
    return loadHistoryState<Pregunta>();
  });
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
  const [lastAttemptId, setLastAttemptId] = useState<string | null>(null);

  const [loaded, setLoaded] = useState<Pregunta[]>([]);
  const [quiz, setQuiz] = useState<Pregunta[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [choiceSets, setChoiceSets] = useState<Choice[][]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selections, setSelections] = useState<Array<Label | null>>([]);
  const [reviewOpen, setReviewOpen] = useState<number>(0);

  const total = quiz.length;
  const current = quiz[idx];

  const nota = useMemo(() => {
    if (!total) return 0;
    return (correct / total) * 20;
  }, [correct, total]);

  const resetRun = () => {
    setQuiz([]);
    setIdx(0);
    setCorrect(0);
    setChoiceSets([]);
    setFeedback(null);
    setSelections([]);
    setLastAttemptId(null);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const goTo = (next: Screen, opts?: { replace?: boolean }) => {
    const nextPath = screenToPath(next);
    if (opts?.replace) window.history.replaceState(null, "", nextPath);
    else window.history.pushState(null, "", nextPath);
    setScreen(next);
  };

  const tryCloseApp = () => {
    // Browsers usually block programmatic close unless the window was opened by script.
    // In installed PWAs, behavior varies by platform.
    window.close();
    // If close is blocked, keep UX consistent by navigating to an Exit page.
    // (If the tab actually closes, this code simply won't matter.)
    setTimeout(() => {
      if (!document.hidden) goTo("exit");
    }, 150);
  };

  const buildQuizList = (questions: Pregunta[], selectedMode: Mode): Pregunta[] => {
    const base = [...questions];
    if (selectedMode === "20" && base.length > 20) {
      shuffleInPlace(base);
      base.length = 20;
    }
    return base;
  };

  const startQuizWith = (questions: Pregunta[], selectedMode: Mode) => {
    const base = buildQuizList(questions, selectedMode);
    if (!base.length) return;
    setQuiz(base);
    setIdx(0);
    setCorrect(0);
    setFeedback(null);
    setChoiceSets(base.map(buildChoices));
    setSelections(new Array(base.length).fill(null));
  };

  const loadFile = async (f: File) => {
    setLoadError(null);
    setHideSetupFilePicker(false);
    try {
      const txt = await f.text();
      const parsed = parsePreguntas(txt);

      const nextFileName = f.name;
      setLoaded(parsed);
      setFileName(nextFileName);
      resetRun();
      if (!parsed.length) {
        setLoadError("No se encontraron preguntas válidas en el archivo.");
        setCurrentSourceId(null);
        return;
      }

      const sourceId = `src_${hashStringDjb2(txt)}`;
      setCurrentSourceId(sourceId);
      setHistory((prev) => {
        const next: HistoryStateV2<Pregunta> = {
          v: 2,
          sources: { ...prev.sources },
          attempts: prev.attempts
        };
        if (!next.sources[sourceId]) {
          next.sources[sourceId] = {
            id: sourceId,
            fileName: nextFileName,
            createdAt: Date.now(),
            preguntas: parsed
          };
        }
        saveHistoryState(next);
        return next;
      });
    } catch {
      setLoaded([]);
      setFileName(f.name);
      resetRun();
      setLoadError("No se pudo leer el archivo.");
      setCurrentSourceId(null);
    }
  };

  const startQuiz = () => {
    if (!loaded.length) return;
    startQuizWith(loaded, mode);
    goTo("quiz");
  };

  useEffect(() => {
    const sync = () => {
      const next = pathToScreen(window.location.pathname);
      setScreen(next);
      if (next === "review") {
        const params = new URLSearchParams(window.location.search);
        const attempt = params.get("attempt");
        setReviewAttemptId(attempt);
      } else {
        setReviewAttemptId(null);
      }
    };

    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const answer = (shownLabel: Label) => {
    if (!current || !choices) return;
    if (revealMode === "instant" && feedback) return;

    const picked = choices.find((c) => c.label === shownLabel);
    if (!picked) return;

    setSelections((prev) => {
      const copy = prev.length ? [...prev] : new Array(total).fill(null);
      copy[idx] = picked.originalLabel;
      return copy;
    });

    if (revealMode === "instant") {
      const correctChoice = choices.find((c) => c.originalLabel === current.respuestaCorrecta);
      if (!correctChoice) return;

      const isCorrect = picked.originalLabel === current.respuestaCorrecta;
      if (isCorrect) setCorrect((x) => x + 1);

      setFeedback({
        selectedShown: picked.label,
        selectedText: picked.text,
        correctShown: correctChoice.label,
        correctText: correctChoice.text,
        isCorrect
      });
    }
  };

  const computeCorrectFrom = (questions: Pregunta[], selected: Array<Label | null>) => {
    let count = 0;
    for (let i = 0; i < questions.length; i++) {
      if (selected[i] && selected[i] === questions[i]!.respuestaCorrecta) count++;
    }
    return count;
  };

  const next = () => {
    if (!total) return;
    const nextIdx = idx + 1;
    if (nextIdx >= total) {
      const selected = selections.length ? selections : new Array(total).fill(null);
      const correctCount = computeCorrectFrom(quiz, selected);
      if (currentSourceId && fileName) {
        const attemptId = createId("att");
        const attempt: QuizAttempt<Pregunta> = {
          id: attemptId,
          createdAt: Date.now(),
          fileName,
          sourceId: currentSourceId,
          mode,
          preguntas: quiz,
          answers: quiz.map((q, i) => ({ selected: selected[i] ?? null, correct: q.respuestaCorrecta }))
        };
        setHistory((prev) => {
          const nextState = pushAttempt(prev, attempt);
          saveHistoryState(nextState);
          return nextState;
        });
        setLastAttemptId(attemptId);
      }

      setCorrect(correctCount);
      goTo("result");
      return;
    }
    setIdx(nextIdx);
    setFeedback(null);
  };

  const prev = () => {
    if (!total) return;
    const prevIdx = idx - 1;
    if (prevIdx < 0) return;
    setIdx(prevIdx);
    setFeedback(null);
  };

  const finalize = () => {
    if (!total) return;
    const selected = selections.length ? selections : new Array(total).fill(null);
    const correctCount = computeCorrectFrom(quiz, selected);
    if (currentSourceId && fileName) {
      const attemptId = createId("att");
      const attempt: QuizAttempt<Pregunta> = {
        id: attemptId,
        createdAt: Date.now(),
        fileName,
        sourceId: currentSourceId,
        mode,
        preguntas: quiz,
        answers: quiz.map((q, i) => ({ selected: selected[i] ?? null, correct: q.respuestaCorrecta }))
      };
      setHistory((prevState) => {
        const nextState = pushAttempt(prevState, attempt);
        saveHistoryState(nextState);
        return nextState;
      });
      setLastAttemptId(attemptId);
    }
    setCorrect(correctCount);
    goTo("result");
  };

  const volverAlMenu = () => {
    goTo("menu");
    setMode("all");
    setRevealMode("instant");
    setFileName(null);
    setLoaded([]);
    setLoadError(null);
    setCurrentSourceId(null);
    setHideSetupFilePicker(false);
    resetRun();
  };

  const progressPct = total ? Math.round(((idx + (feedback ? 1 : 0)) / total) * 100) : 0;
  const answeredCount = useMemo(() => selections.filter((x) => x !== null).length, [selections]);

  const choices = choiceSets[idx] ?? null;

  const showHero = screen === "menu" || screen === "exit";

  const toggleTheme = () => {
    setTheme((cur) => (cur === "dark" ? "light" : "dark"));
  };

  const openHistory = () => {
    goTo("history");
  };

  const openReview = (attemptId: string) => {
    const url = new URL(window.location.href);
    url.pathname = "/review";
    url.searchParams.set("attempt", attemptId);
    window.history.pushState(null, "", url.toString());
    setReviewAttemptId(attemptId);
    setReviewOpen(0);
    setScreen("review");
  };

  const retakeAttempt = (attempt: QuizAttempt<Pregunta>) => {
    setFileName(attempt.fileName);
    setLoaded(attempt.preguntas);
    setCurrentSourceId(attempt.sourceId);
    setMode(attempt.mode);
    setLoadError(null);
    setHideSetupFilePicker(true);
    resetRun();
    startQuizWith(attempt.preguntas, attempt.mode);
    goTo("quiz");
  };

  const loadSourceToSetup = (src: QuizSource<Pregunta>) => {
    setFileName(src.fileName);
    setLoaded(src.preguntas);
    setCurrentSourceId(src.id);
    setLoadError(null);
    setHideSetupFilePicker(true);
    resetRun();
    goTo("setup");
  };

  const attForReview = reviewAttemptId ? history.attempts.find((a) => a.id === reviewAttemptId) : undefined;

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <QuizHeader
            showHero={showHero}
            theme={theme}
            fileName={fileName}
            onToggleTheme={toggleTheme}
            onHistory={openHistory}
            onSetup={() => {
              setHideSetupFilePicker(false);
              goTo("setup");
            }}
            onMenu={volverAlMenu}
          />

          {screen === "menu" && (
            <MenuScreen
              onSetup={() => {
                setHideSetupFilePicker(false);
                goTo("setup");
              }}
              onHistory={openHistory}
              onExit={tryCloseApp}
            />
          )}

          {screen === "exit" && <ExitScreen onTryClose={tryCloseApp} onBackToMenu={() => goTo("menu", { replace: true })} />}

          {screen === "setup" && (
            <SetupScreen
              mode={mode}
              revealMode={revealMode}
              fileName={fileName}
              loadedCount={loaded.length}
              loadError={loadError}
              hideFilePicker={hideSetupFilePicker}
              onModeChange={setMode}
              onRevealModeChange={setRevealMode}
              onFileSelected={(f) => void loadFile(f)}
              onShowFilePicker={() => setHideSetupFilePicker(false)}
              onBack={() => goTo("menu")}
              onHistory={openHistory}
              onStart={startQuiz}
            />
          )}

          {screen === "history" && (
            <HistoryScreen
              history={history}
              onBack={() => goTo("menu")}
              onLoadSource={loadSourceToSetup}
              onOpenReview={openReview}
              onRetake={retakeAttempt}
            />
          )}

          {screen === "review" &&
            (attForReview ? (
              <ReviewScreen
                attempt={attForReview}
                reviewOpen={reviewOpen}
                onToggleOpen={(i) => setReviewOpen((cur) => (cur === i ? -1 : i))}
                onBackToHistory={() => goTo("history")}
                onRetake={() => retakeAttempt(attForReview)}
              />
            ) : (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                    <h2 className="h4 mb-0">Revisión</h2>
                    <button className="btn btn-outline-secondary" onClick={() => goTo("history")}>
                      Volver
                    </button>
                  </div>
                  <div className="alert alert-warning mb-0">No se encontró ese intento.</div>
                </div>
              </div>
            ))}

          {screen === "quiz" && quiz.length === 0 && <EmptyQuizScreen onGoSetup={() => goTo("setup", { replace: true })} />}

          {screen === "quiz" && current && choices && (
            <QuizScreen
              idx={idx}
              total={total}
              correct={correct}
              answeredCount={answeredCount}
              mode={mode}
              revealMode={revealMode}
              enunciado={current.enunciado}
              choices={choices}
              selectedOriginal={selections[idx] ?? null}
              feedback={feedback}
              progressPct={progressPct}
              onAnswer={answer}
              onNext={() => (revealMode === "final" ? setIdx((x) => Math.min(x + 1, total - 1)) : next())}
              onPrev={prev}
              onFinalize={finalize}
              onMenu={volverAlMenu}
            />
          )}

          {screen === "result" && (
            <ResultScreen
              correct={correct}
              total={total}
              nota={nota}
              canRepeat={!!loaded.length}
              canReview={!!lastAttemptId}
              onReview={() => lastAttemptId && openReview(lastAttemptId)}
              onRepeat={() => {
                resetRun();
                startQuiz();
              }}
              onSetup={() => goTo("setup")}
              onHistory={openHistory}
              onMenu={volverAlMenu}
            />
          )}
        </div>
      </div>
    </div>
  );
}
