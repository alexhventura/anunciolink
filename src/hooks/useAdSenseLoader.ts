import { useCallback, useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "../lib/constants";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let adsenseScriptInjected = false;
const readyCallbacks = new Set<() => void>();

function notifyAdSenseReady() {
  readyCallbacks.forEach((cb) => cb());
}

function injectAdSenseScript(clientId: string): void {
  if (adsenseScriptInjected) return;

  const existing = document.querySelector('script[data-adsense="true"]') as HTMLScriptElement | null;
  if (existing) {
    adsenseScriptInjected = true;
    if (existing.dataset.loaded === "true") notifyAdSenseReady();
    else existing.addEventListener("load", notifyAdSenseReady, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-adsense", "true");
  script.addEventListener(
    "load",
    () => {
      script.dataset.loaded = "true";
      notifyAdSenseReady();
    },
    { once: true }
  );
  document.head.appendChild(script);
  adsenseScriptInjected = true;
}

interface AdSenseLoaderOptions {
  /** Carrega o script imediatamente — essencial para links /a/ compartilhados */
  eager?: boolean;
}

export function useAdSenseLoader(enabled: boolean, options: AdSenseLoaderOptions = {}) {
  const { eager = false } = options;
  const [ready, setReady] = useState(false);
  const activatedRef = useRef(false);

  const activate = useCallback(() => {
    if (activatedRef.current || !ADSENSE_CLIENT) return undefined;
    activatedRef.current = true;
    injectAdSenseScript(ADSENSE_CLIENT);

    const markReady = () => setReady(true);
    readyCallbacks.add(markReady);

    const existing = document.querySelector('script[data-adsense="true"]') as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      markReady();
    }

    return () => {
      readyCallbacks.delete(markReady);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !ADSENSE_CLIENT) return;

    if (eager) {
      const cleanup = activate();
      return cleanup;
    }

    const onInteraction = () => activate();

    window.addEventListener("pointerdown", onInteraction, { passive: true, once: true });
    window.addEventListener("keydown", onInteraction, { once: true });
    window.addEventListener("scroll", onInteraction, { passive: true, once: true });

    const fallback = window.setTimeout(activate, 3000);

    return () => {
      window.clearTimeout(fallback);
    };
  }, [enabled, eager, activate]);

  return { adsenseReady: ready || !ADSENSE_CLIENT, activateAdSense: activate };
}

export function pushAdSenseSlot() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    /* placeholder permanece */
  }
}
