type Props = {
  onTryClose: () => void;
  onBackToMenu: () => void;
};

export function ExitScreen({ onTryClose, onBackToMenu }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-2">Salir</h2>
        <p className="text-body-secondary mb-3">
          Por seguridad, la mayoría de navegadores no permiten cerrar una pestaña/app desde código.
        </p>
        <div className="alert alert-info">
          Si no se cerró automáticamente: cierra la pestaña manualmente (PC) o desliza/ciérrala desde el gestor de apps
          (móvil / PWA instalada).
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onTryClose}>
            Intentar cerrar
          </button>
          <button className="btn btn-outline-secondary" onClick={onBackToMenu}>
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}
