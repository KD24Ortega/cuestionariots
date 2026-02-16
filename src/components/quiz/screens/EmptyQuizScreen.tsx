type Props = {
  onGoSetup: () => void;
};

export function EmptyQuizScreen({ onGoSetup }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h5 mb-2">No hay un cuestionario en curso</h2>
        <p className="text-body-secondary mb-3">
          Para empezar, carga un archivo y pulsa <b>Empezar</b>.
        </p>
        <button className="btn btn-primary" onClick={onGoSetup}>
          Ir a configuración
        </button>
      </div>
    </div>
  );
}
