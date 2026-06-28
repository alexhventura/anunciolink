import { useCallback, useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "../lib/constants";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let adsenseScriptInjected = false;

function injectAdSenseScript(clientId: string) {
  if (adsenseScriptInjected || document.querySelector('script[data-adsense="true"]')) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-adsense", "true");
  document.head.appendChild(script);
  adsenseScriptInjected = true;
}

export function useAdSenseLoader(enabled: boolean) {
  const [ready, setReady] = useState(false);
  const activatedRef = useRef(false);

  const activate = useCallback(() => {
    if (activatedRef.current || !ADSENSE_CLIENT) return;
    activatedRef.current = true;
    injectAdSenseScript(ADSENSE_CLIENT);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!enabled || !ADSENSE_CLIENT) return;

    const onInteraction = () => {
      activate();
    };

    window.addEventListener("pointerdown", onInteraction, { passive: true, once: true });
    window.addEventListener("keydown", onInteraction, { once: true });
    window.addEventListener("scroll", onInteraction, { passive: true, once: true });

    const fallback = window.setTimeout(activate, 5000);

    return () => {
      window.clearTimeout(fallback);
    };
  }, [enabled, activate]);

  return { adsenseReady: ready || !ADSENSE_CLIENT, activateAdSense: activate };
}

export function pushAdSenseSlot() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    /* placeholder permanece */
  }
}
