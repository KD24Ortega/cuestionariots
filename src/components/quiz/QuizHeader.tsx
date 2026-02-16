import type { Theme } from "../../lib/quizTypes";

type Props = {
  showHero: boolean;
  theme: Theme;
  fileName: string | null;
  onToggleTheme: () => void;
  onHistory: () => void;
  onSetup: () => void;
  onMenu: () => void;
};

export function QuizHeader({ showHero, theme, fileName, onToggleTheme, onHistory, onSetup, onMenu }: Props) {
  if (showHero) {
    return (
      <div className="marketing-hero position-relative rounded-4 p-4 p-md-5 shadow-sm mb-4">
        <div className="position-absolute top-0 end-0 p-3">
          <button type="button" className="btn btn-sm btn-outline-light" onClick={onToggleTheme}>
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>
        <div>
          <h1 className="display-6 fw-semibold mb-2">Cuestionario</h1>
          <p className="lead mb-0 opacity-90">Carga tu archivo y practica con corrección automática.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
      <div>
        <div className="fw-semibold">Cuestionario</div>
        <div className="text-body-secondary small">{fileName ? <>Archivo: <b>{fileName}</b></> : <>Archivo: —</>}</div>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" onClick={onToggleTheme}>
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>
        <button className="btn btn-outline-secondary" onClick={onHistory}>Historial</button>
        <button className="btn btn-outline-secondary" onClick={onSetup}>Configuración</button>
        <button className="btn btn-outline-secondary" onClick={onMenu}>Menú</button>
      </div>
    </div>
  );
}
