import type { QuizAttempt } from "../../../lib/quizTypes";

type Props<Pregunta extends { enunciado: string; opciones: string[]; respuestaCorrecta: string }> = {
  attempt: QuizAttempt<Pregunta>;
  reviewOpen: number;
  onToggleOpen: (idx: number) => void;
  onBackToHistory: () => void;
  onRetake: () => void;
};

export function ReviewScreen<Pregunta extends { enunciado: string; opciones: string[]; respuestaCorrecta: string }>({
  attempt,
  reviewOpen,
  onToggleOpen,
  onBackToHistory,
  onRetake
}: Props<Pregunta>) {
  const totalQ = attempt.preguntas.length;
  const correctQ = attempt.answers.reduce((acc, a) => acc + (a.selected !== null && a.selected === a.correct ? 1 : 0), 0);
  const grade = totalQ ? (correctQ / totalQ) * 20 : 0;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
          <div>
            <h2 className="h4 mb-0">Revisión</h2>
            <div className="text-body-secondary small">
              {attempt.fileName} · {new Date(attempt.createdAt).toLocaleString()} · Modo: {attempt.mode === "20" ? "20" : "Completo"}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={onBackToHistory}>
              Historial
            </button>
            <button className="btn btn-primary" onClick={onRetake}>
              Repetir
            </button>
          </div>
        </div>

        <div className="row g-3 my-1">
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded bg-body-tertiary">
              <div className="text-body-secondary">Correctas</div>
              <div className="h4 mb-0">
                {correctQ} / {totalQ}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded bg-body-tertiary">
              <div className="text-body-secondary">Nota sobre 20</div>
              <div className="h4 mb-0">{grade.toFixed(2)} / 20</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          {attempt.preguntas.map((q, i) => {
            const a = attempt.answers[i];
            const ok = a?.selected !== null && a?.selected === a?.correct;
            const isOpen = reviewOpen === i;
            return (
              <div className="card mb-2" key={i}>
                <button type="button" className="btn btn-light text-start" onClick={() => onToggleOpen(i)}>
                  <span
                    className={`badge me-2 ${a?.selected === null ? "text-bg-secondary" : ok ? "text-bg-success" : "text-bg-danger"}`}
                  >
                    {a?.selected === null ? "SR" : ok ? "OK" : "MAL"}
                  </span>
                  <b>Pregunta {i + 1}</b>
                  <span className="text-body-secondary ms-2">(clic para {isOpen ? "ocultar" : "ver"})</span>
                </button>

                {isOpen && (
                  <div className="card-body">
                    <div className="quiz-prewrap mb-3">{q.enunciado}</div>
                    <div className="list-group">
                      {(["A", "B", "C", "D"] as const).map((lab, idx2) => {
                        const text = q.opciones[idx2];
                        const isSel = a?.selected === lab;
                        const isCor = q.respuestaCorrecta === lab;
                        let cls = "list-group-item";
                        if (isSel && isCor) cls += " list-group-item-success";
                        else if (isSel && !isCor) cls += " list-group-item-danger";
                        else if (isCor) cls += " list-group-item-success";
                        return (
                          <div key={lab} className={cls}>
                            <b className="me-2">{lab})</b> {text}
                            {isSel && <span className="badge text-bg-dark ms-2">Tu elección</span>}
                            {isCor && <span className="badge text-bg-success ms-2">Correcta</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="alert alert-info mt-3 mb-0">
          Nota: esta revisión muestra las opciones en el orden original (A-D), y tu selección guardada para ese intento.
        </div>
      </div>
    </div>
  );
}
