import { useEffect, useRef } from "react";
import type { AdSenseSlot } from "../types/ad";
import { ADSENSE_CLIENT, ADSENSE_SLOTS } from "../lib/constants";
import { pushAdSenseSlot } from "../hooks/useAdSenseLoader";

interface AdSenseSlotProps {
  slot: AdSenseSlot;
  ready: boolean;
}

export function AdSenseSlot({ slot, ready }: AdSenseSlotProps) {
  const pushedRef = useRef(false);
  const insRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const config = ADSENSE_SLOTS[slot];
  const hasRealSlot = Boolean(ADSENSE_CLIENT && config.slotId);

  const tryPush = () => {
    if (!ready || !hasRealSlot || pushedRef.current || !insRef.current) return;
    pushedRef.current = true;
    pushAdSenseSlot();
  };

  useEffect(() => {
    pushedRef.current = false;
  }, [slot, hasRealSlot]);

  useEffect(() => {
    if (!ready || !hasRealSlot || !asideRef.current) return;

    const aside = asideRef.current;

    if (typeof IntersectionObserver === "undefined") {
      tryPush();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(() => tryPush());
          } else {
            window.setTimeout(tryPush, 0);
          }
        }
      },
      { rootMargin: "120px 0px", threshold: 0.01 }
    );

    observer.observe(aside);
    return () => observer.disconnect();
  }, [ready, hasRealSlot]);

  return (
    <aside
      ref={asideRef}
      className={`adsense-slot adsense-slot--${slot} no-print w-full overflow-hidden`}
      aria-label={`Espaço reservado para anúncio (${config.label})`}
      data-ad-slot={slot}
    >
      {hasRealSlot ? (
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: config.minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={config.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="adsense-slot__placeholder flex items-center justify-center text-[10px] font-bold uppercase text-zinc-500"
          style={{ minHeight: config.minHeight }}
          aria-hidden="true"
        >
          Patrocinado
        </div>
      )}
    </aside>
  );
}
