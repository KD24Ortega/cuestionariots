import type { HistoryStateV2, QuizAttempt, QuizSource } from "../../../lib/quizTypes";

type Props<Pregunta> = {
  history: HistoryStateV2<Pregunta>;
  onBack: () => void;
  onLoadSource: (src: QuizSource<Pregunta>) => void;
  onOpenReview: (attemptId: string) => void;
  onRetake: (attempt: QuizAttempt<Pregunta>) => void;
};

export function HistoryScreen<Pregunta>({ history, onBack, onLoadSource, onOpenReview, onRetake }: Props<Pregunta>) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
          <h2 className="h4 mb-0">Historial</h2>
          <button className="btn btn-outline-secondary" onClick={onBack}>
            Volver
          </button>
        </div>
        <p className="text-body-secondary mb-4">
          Repite cuestionarios anteriores, revisa tus notas y consulta qué marcaste en cada pregunta.
        </p>

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <h3 className="h6 text-uppercase text-body-secondary">Cuestionarios cargados</h3>
            {Object.keys(history.sources).length === 0 ? (
              <div className="text-body-secondary">Aún no has cargado ningún cuestionario.</div>
            ) : (
              <div className="list-group">
                {Object.values(history.sources)
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                      onClick={() => onLoadSource(src)}
                    >
                      <div>
                        <div className="fw-semibold">{src.fileName}</div>
                        <div className="small text-body-secondary">Preguntas: {src.preguntas.length}</div>
                      </div>
                      <span className="badge text-bg-secondary">Cargar</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="col-12 col-lg-7">
            <h3 className="h6 text-uppercase text-body-secondary">Intentos</h3>
            {history.attempts.length === 0 ? (
              <div className="text-body-secondary">Aún no has completado ningún intento.</div>
            ) : (
              <div className="list-group">
                {history.attempts.map((att) => {
                  const totalQ = att.preguntas.length;
                  const correctQ = att.answers.reduce(
                    (acc, a) => acc + (a.selected !== null && a.selected === a.correct ? 1 : 0),
                    0
                  );
                  const grade = totalQ ? (correctQ / totalQ) * 20 : 0;
                  const date = new Date(att.createdAt).toLocaleString();
                  return (
                    <div key={att.id} className="list-group-item">
                      <div className="d-flex flex-wrap gap-2 align-items-start justify-content-between">
                        <div>
                          <div className="fw-semibold">{att.fileName}</div>
                          <div className="small text-body-secondary">
                            {date} · Modo: {att.mode === "20" ? "20" : "Completo"}
                          </div>
                          <div className="small text-body-secondary">
                            Correctas: {correctQ}/{totalQ} · Nota: {grade.toFixed(2)}/20
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => onOpenReview(att.id)}>
                            Ver
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => onRetake(att)}>
                            Repetir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
