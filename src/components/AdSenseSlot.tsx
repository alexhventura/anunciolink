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
  const config = ADSENSE_SLOTS[slot];
  const hasRealSlot = Boolean(ADSENSE_CLIENT && config.slotId);

  useEffect(() => {
    if (!ready || !hasRealSlot || pushedRef.current) return;
    pushedRef.current = true;
    pushAdSenseSlot();
  }, [ready, hasRealSlot]);

  return (
    <aside
      className={`adsense-slot adsense-slot--${slot} w-full overflow-hidden`}
      aria-label={`Espaço reservado para anúncio (${config.label})`}
      data-ad-slot={slot}
    >
      {hasRealSlot ? (
        <ins
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
          aria-hidden="true"
        >
          Patrocinado
        </div>
      )}
    </aside>
  );
}
