type Props = {
  correct: number;
  total: number;
  nota: number;
  canRepeat: boolean;
  canReview: boolean;
  onReview: () => void;
  onRepeat: () => void;
  onSetup: () => void;
  onHistory: () => void;
  onMenu: () => void;
};

export function ResultScreen({
  correct,
  total,
  nota,
  canRepeat,
  canReview,
  onReview,
  onRepeat,
  onSetup,
  onHistory,
  onMenu
}: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-2">Resultado final</h2>
        <p className="text-body-secondary mb-4">
          Resumen de tu sesión. Si repites, se volverán a mezclar las preguntas/opciones.
        </p>

        <div className="row g-3 my-1">
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded bg-body-tertiary">
              <div className="text-body-secondary">Correctas</div>
              <div className="h4 mb-0">
                {correct} / {total}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded bg-body-tertiary">
              <div className="text-body-secondary">Nota sobre 20</div>
              <div className="h4 mb-0">{nota.toFixed(2)} / 20</div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-3">
          {canReview && (
            <button className="btn btn-outline-primary" onClick={onReview}>
              Ver revisión
            </button>
          )}
          <button className="btn btn-primary" onClick={onRepeat} disabled={!canRepeat}>
            Repetir
          </button>
          <button className="btn btn-outline-secondary" onClick={onSetup}>
            Cambiar archivo / modo
          </button>
          <button className="btn btn-outline-primary" onClick={onHistory}>
            Historial
          </button>
          <button className="btn btn-outline-secondary" onClick={onMenu}>
            Menú principal
          </button>
        </div>
      </div>
    </div>
  );
}
