type Props = {
  onSetup: () => void;
  onHistory: () => void;
  onExit: () => void;
};

export function MenuScreen({ onSetup, onHistory, onExit }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-7">
            <h2 className="h4 mb-2">Menú principal</h2>
            <p className="text-body-secondary mb-3">
              Diseñado para estudiar con ritmo: preguntas mezcladas, corrección instantánea y nota final.
            </p>
            <ul className="list-unstyled mb-0 text-body-secondary">
              <li className="mb-2">
                <span className="me-2">•</span>Modo completo o selección aleatoria de 20
              </li>
              <li className="mb-2">
                <span className="me-2">•</span>Te dice cuál era la correcta al fallar
              </li>
              <li className="mb-0">
                <span className="me-2">•</span>Nota sobre 20 con 2 decimales
              </li>
            </ul>
          </div>
          <div className="col-12 col-md-5">
            <div className="d-grid gap-2">
              <button className="btn btn-primary btn-lg" onClick={onSetup}>
                Empezar ahora
              </button>
              <button className="btn btn-outline-primary" onClick={onHistory}>
                Historial
              </button>
              <button className="btn btn-outline-secondary" onClick={onExit}>
                Salir
              </button>
            </div>
            <div className="small text-body-secondary mt-3">
              Consejo: usa un archivo con el formato A)/B)/C)/D) y <b>ANSWER: X</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
