export type Mode = "all" | "20";
export type RevealMode = "instant" | "final";
export type Screen = "menu" | "setup" | "quiz" | "result" | "history" | "review" | "exit";
export type Label = "A" | "B" | "C" | "D";
export type Theme = "light" | "dark";

export type Choice = { label: Label; text: string; originalLabel: Label };

export type Feedback = {
  selectedShown: Label;
  selectedText: string;
  correctShown: Label;
  correctText: string;
  isCorrect: boolean;
};

export type AttemptAnswer = {
  selected: Label | null;
  correct: Label;
};

export type QuizSource<Pregunta> = {
  id: string;
  fileName: string;
  createdAt: number;
  preguntas: Pregunta[];
};

export type QuizAttempt<Pregunta> = {
  id: string;
  createdAt: number;
  fileName: string;
  sourceId: string;
  mode: Mode;
  preguntas: Pregunta[];
  answers: AttemptAnswer[];
};

export type HistoryStateV2<Pregunta> = {
  v: 2;
  sources: Record<string, QuizSource<Pregunta>>;
  attempts: Array<QuizAttempt<Pregunta>>;
};
