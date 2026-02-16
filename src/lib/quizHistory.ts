import type { HistoryStateV2, Label, QuizAttempt, QuizSource } from "./quizTypes";

const HISTORY_KEY = "quizpwa.history";

export function createId(prefix: string): string {
  const cryptoObj = globalThis.crypto;
  const raw =
    cryptoObj && "randomUUID" in cryptoObj
      ? cryptoObj.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${raw}`;
}

export function hashStringDjb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function isLabel(x: unknown): x is Label {
  return x === "A" || x === "B" || x === "C" || x === "D";
}

function isPreguntaLike(x: unknown): x is { enunciado: string; opciones: string[]; respuestaCorrecta: Label } {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.enunciado !== "string") return false;
  if (!Array.isArray(obj.opciones) || obj.opciones.length !== 4) return false;
  if (!obj.opciones.every((o) => typeof o === "string")) return false;
  if (!isLabel(obj.respuestaCorrecta)) return false;
  return true;
}

function isAttemptAnswer(x: unknown): x is { selected: Label | null; correct: Label } {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  const selected = obj.selected;
  const selectedOk = selected === null || isLabel(selected);
  return selectedOk && isLabel(obj.correct);
}

function isQuizSource<Pregunta>(x: unknown): x is QuizSource<Pregunta> {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "string") return false;
  if (typeof obj.fileName !== "string") return false;
  if (typeof obj.createdAt !== "number") return false;
  if (!Array.isArray(obj.preguntas) || !obj.preguntas.every(isPreguntaLike)) return false;
  return true;
}

function isQuizAttempt<Pregunta>(x: unknown): x is QuizAttempt<Pregunta> {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "string") return false;
  if (typeof obj.createdAt !== "number") return false;
  if (typeof obj.fileName !== "string") return false;
  if (typeof obj.sourceId !== "string") return false;
  if (obj.mode !== "all" && obj.mode !== "20") return false;
  if (!Array.isArray(obj.preguntas) || !obj.preguntas.every(isPreguntaLike)) return false;
  if (!Array.isArray(obj.answers) || !obj.answers.every(isAttemptAnswer)) return false;
  return true;
}

export function loadHistoryState<Pregunta>(): HistoryStateV2<Pregunta> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { v: 2, sources: {}, attempts: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { v: 2, sources: {}, attempts: [] };
    const obj = parsed as Record<string, unknown>;

    const v = obj.v;
    if (v !== 1 && v !== 2) return { v: 2, sources: {}, attempts: [] };

    const sourcesRaw = obj.sources;
    const attemptsRaw = obj.attempts;
    if (!sourcesRaw || typeof sourcesRaw !== "object" || !Array.isArray(attemptsRaw)) {
      return { v: 2, sources: {}, attempts: [] };
    }

    const sources: Record<string, QuizSource<Pregunta>> = {};
    for (const [key, value] of Object.entries(sourcesRaw as Record<string, unknown>)) {
      if (isQuizSource<Pregunta>(value)) sources[key] = value;
    }

    const attempts = (attemptsRaw as unknown[]).filter(isQuizAttempt<Pregunta>).slice(0, 10);
    return { v: 2, sources, attempts };
  } catch {
    return { v: 2, sources: {}, attempts: [] };
  }
}

export function saveHistoryState<Pregunta>(state: HistoryStateV2<Pregunta>) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function pushAttempt<Pregunta>(prev: HistoryStateV2<Pregunta>, attempt: QuizAttempt<Pregunta>): HistoryStateV2<Pregunta> {
  return {
    v: 2,
    sources: prev.sources,
    attempts: [attempt, ...prev.attempts].slice(0, 10)
  };
}
