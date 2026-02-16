// src/components/PwaUpdater.tsx
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdater() {
  const AUTO_DISMISS_MS = 10_000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    immediate: true,
    onRegistered() {
      // opcional: console.log("SW registered", r);
    },
    onRegisterError(error: unknown) {
      console.error("SW register error", error);
    }
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const dismissTimerId = useRef<number | null>(null);

  const hasMessage = offlineReady || needRefresh || (Boolean(installPrompt) && !installed);

  const clearAutoDismissTimer = () => {
    if (dismissTimerId.current != null) {
      window.clearTimeout(dismissTimerId.current);
      dismissTimerId.current = null;
    }
  };

  const scheduleAutoDismiss = () => {
    clearAutoDismissTimer();
    dismissTimerId.current = window.setTimeout(() => {
      setIsDismissing(true);
    }, AUTO_DISMISS_MS);
  };

  useEffect(() => {
    const onBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!hasMessage) {
      clearAutoDismissTimer();
      setIsDismissing(false);
      return;
    }

    setIsDismissing(false);
    scheduleAutoDismiss();
    return () => clearAutoDismissTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMessage]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setInstallPrompt(null);
  };

  const onInteract = () => {
    if (!hasMessage) return;
    if (isDismissing) setIsDismissing(false);
    scheduleAutoDismiss();
  };

  const onDismissTransitionEnd = () => {
    if (!isDismissing) return;
    close();
    setIsDismissing(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (!hasMessage) return null;

  return (
    <div className="position-fixed bottom-0 end-0 p-3 pwa-toast" style={{ zIndex: 1080 }}>
      <div
        className={
          "pwa-toast__card d-flex align-items-center gap-3 border rounded-3 bg-body-tertiary shadow-sm p-3 " +
          (isDismissing ? "pwa-toast__card--hidden" : "")
        }
        role="status"
        aria-live="polite"
        onPointerEnter={onInteract}
        onPointerMove={onInteract}
        onFocusCapture={onInteract}
        onKeyDownCapture={onInteract}
        onTransitionEnd={onDismissTransitionEnd}
      >
        <div className="small" style={{ lineHeight: 1.2 }}>
          {offlineReady && <div>Listo para usarse sin internet.</div>}
          {needRefresh && <div>Hay una actualización disponible.</div>}
          {installPrompt && !installed && <div>Puedes instalar esta app.</div>}
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {needRefresh && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => updateServiceWorker(true)}
            >
              Actualizar
            </button>
          )}
          {installPrompt && !installed && (
            <button type="button" className="btn btn-sm btn-primary" onClick={install}>
              Instalar
            </button>
          )}
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setIsDismissing(true)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
