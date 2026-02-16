import type { Mode, RevealMode } from "../../../lib/quizTypes";

type Props = {
  mode: Mode;
  revealMode: RevealMode;
  fileName: string | null;
  loadedCount: number;
  loadError: string | null;
  hideFilePicker: boolean;
  onModeChange: (mode: Mode) => void;
  onRevealModeChange: (mode: RevealMode) => void;
  onFileSelected: (f: File) => void;
  onShowFilePicker: () => void;
  onBack: () => void;
  onHistory: () => void;
  onStart: () => void;
};

export function SetupScreen({
  mode,
  revealMode,
  fileName,
  loadedCount,
  loadError,
  hideFilePicker,
  onModeChange,
  onRevealModeChange,
  onFileSelected,
  onShowFilePicker,
  onBack,
  onHistory,
  onStart
}: Props) {
  const hasLoaded = loadedCount > 0;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
          <h2 className="h4 mb-0">Configuración</h2>
          <span className="badge text-bg-secondary">Paso 1 de 1</span>
        </div>
        <p className="text-body-secondary mb-4">
          Sube el archivo y elige el modo. En cuanto pulses <b>Empezar</b>, se mezclarán las opciones.
        </p>

        {hideFilePicker ? (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
              <div className="text-body-secondary">
                Archivo cargado: <b>{fileName ?? "—"}</b>
                <span className="mx-2">·</span>
                Preguntas: <b>{loadedCount}</b>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onShowFilePicker}>
                Cambiar archivo
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Archivo de preguntas (.txt)</label>
            <input
              className="form-control"
              type="file"
              accept=".txt"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileSelected(f);
              }}
            />
            <div className="form-text">
              Formato: enunciado, luego A)/B)/C)/D) y una línea <b>ANSWER: X</b>.
            </div>
          </div>
        )}

        {loadError && <div className="alert alert-warning mb-3">{loadError}</div>}

        <div className="mb-3">
          <label className="form-label">Modo</label>
          <div className="btn-group w-100" role="group" aria-label="Modo">
            <input
              type="radio"
              className="btn-check"
              name="modo"
              id="modo-all"
              checked={mode === "all"}
              onChange={() => onModeChange("all")}
              disabled={!hasLoaded}
            />
            <label className="btn btn-outline-primary" htmlFor="modo-all">
              Todo el cuestionario
            </label>

            <input
              type="radio"
              className="btn-check"
              name="modo"
              id="modo-20"
              checked={mode === "20"}
              onChange={() => onModeChange("20")}
              disabled={!hasLoaded}
            />
            <label className="btn btn-outline-primary" htmlFor="modo-20">
              Solo 20 preguntas
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Corrección</label>
          <div className="btn-group w-100" role="group" aria-label="Corrección">
            <input
              type="radio"
              className="btn-check"
              name="reveal"
              id="reveal-instant"
              checked={revealMode === "instant"}
              onChange={() => onRevealModeChange("instant")}
              disabled={!hasLoaded}
            />
            <label className="btn btn-outline-primary" htmlFor="reveal-instant">
              Inmediata (muestra la correcta)
            </label>

            <input
              type="radio"
              className="btn-check"
              name="reveal"
              id="reveal-final"
              checked={revealMode === "final"}
              onChange={() => onRevealModeChange("final")}
              disabled={!hasLoaded}
            />
            <label className="btn btn-outline-primary" htmlFor="reveal-final">
              Al final (revisión al terminar)
            </label>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="text-body-secondary">
            {fileName ? (
              <>
                Listo: <b>{fileName}</b> · Preguntas: <b>{loadedCount}</b>
              </>
            ) : (
              <>Aún no has cargado un archivo.</>
            )}
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={onBack}>
              Volver
            </button>
            <button className="btn btn-outline-primary" onClick={onHistory}>
              Historial
            </button>
            <button className="btn btn-primary" onClick={onStart} disabled={!hasLoaded}>
              Empezar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
