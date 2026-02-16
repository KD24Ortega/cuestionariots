import type { Choice, Feedback, Label, Mode, RevealMode } from "../../../lib/quizTypes";

type Props = {
  idx: number;
  total: number;
  correct: number;
  answeredCount: number;
  mode: Mode;
  revealMode: RevealMode;
  enunciado: string;
  choices: Choice[];
  selectedOriginal: Label | null;
  feedback: Feedback | null;
  progressPct: number;
  onAnswer: (shown: Label) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinalize: () => void;
  onMenu: () => void;
};

export function QuizScreen({
  idx,
  total,
  correct,
  answeredCount,
  mode,
  revealMode,
  enunciado,
  choices,
  selectedOriginal,
  feedback,
  progressPct,
  onAnswer,
  onNext,
  onPrev,
  onFinalize,
  onMenu
}: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
          <div className="text-body-secondary">
            Pregunta <b>{idx + 1}</b> de <b>{total}</b>
            <span className="mx-2">·</span>
            {revealMode === "instant" ? (
              <>Aciertos: <b>{correct}</b></>
            ) : (
              <>Respondidas: <b>{answeredCount}</b></>
            )}
          </div>
          <div className="text-body-secondary">
            Modo: <b>{mode === "20" ? "20 preguntas" : "Completo"}</b>
          </div>
        </div>

        <div
          className="progress mb-3"
          role="progressbar"
          aria-label="Progreso"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="p-3 border rounded bg-body-tertiary mb-3 quiz-prewrap">{enunciado}</div>

        <div className="d-grid gap-2">
          {choices.map((c) => {
            const isSelectedShown = feedback?.selectedShown === c.label;
            const isCorrectShown = feedback?.correctShown === c.label;
            const isSelectedOriginal = selectedOriginal !== null && c.originalLabel === selectedOriginal;

            let className = "btn btn-outline-primary text-start";
            if (revealMode === "final") {
              className = isSelectedOriginal ? "btn btn-primary text-start" : "btn btn-outline-primary text-start";
            } else if (feedback) {
              if (isSelectedShown && feedback.isCorrect) className = "btn btn-success text-start";
              else if (isSelectedShown && !feedback.isCorrect) className = "btn btn-danger text-start";
              else if (isCorrectShown) className = "btn btn-outline-success text-start";
              else className = "btn btn-outline-secondary text-start";
            }

            return (
              <button
                key={c.label}
                className={className}
                onClick={() => onAnswer(c.label)}
                disabled={revealMode === "instant" ? !!feedback : false}
              >
                <b className="me-2">{c.label})</b> {c.text}
              </button>
            );
          })}
        </div>

        {revealMode === "instant" && feedback && (
          <div className="mt-3">
            <div className={`alert ${feedback.isCorrect ? "alert-success" : "alert-danger"} mb-3`}>
              {feedback.isCorrect ? (
                <>
                  <b>¡Correcto!</b> Elegiste {feedback.selectedShown}) {feedback.selectedText}
                </>
              ) : (
                <>
                  <b>Incorrecto.</b> Elegiste {feedback.selectedShown}) {feedback.selectedText}
                  <br />
                  La respuesta correcta era {feedback.correctShown}) {feedback.correctText}
                </>
              )}
            </div>

            <div className="d-flex justify-content-between gap-2">
              <button className="btn btn-outline-secondary" onClick={onMenu}>
                Menú principal
              </button>
              <button className="btn btn-primary" onClick={onNext}>
                {idx + 1 >= total ? "Ver resultado" : "Siguiente"}
              </button>
            </div>
          </div>
        )}

        {revealMode === "final" && (
          <div className="mt-3">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <button className="btn btn-outline-secondary" onClick={onMenu}>
                Menú principal
              </button>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={onPrev} disabled={idx === 0}>
                  Anterior
                </button>
                <button className="btn btn-outline-primary" onClick={onNext} disabled={idx + 1 >= total}>
                  Siguiente
                </button>
                <button className="btn btn-primary" onClick={onFinalize}>
                  Finalizar
                </button>
              </div>
            </div>
            <div className="small text-body-secondary mt-2">
              En este modo no se muestra la respuesta correcta hasta finalizar. Puedes volver atrás y cambiar tu elección.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
