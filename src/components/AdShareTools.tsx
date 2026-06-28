import { Share2 } from "lucide-react";
import { useMemo } from "react";
import type { AdData } from "../types/ad";
import { buildQrShareUrl } from "../lib/qrShareUrl";
import { AdPrintPoster } from "./AdPrintPoster";
import { AdSocialCardDownload } from "./AdSocialCardDownload";

interface AdShareToolsProps {
  ad: AdData;
  variant?: "create" | "checkout";
}

export function AdShareTools({ ad, variant = "checkout" }: AdShareToolsProps) {
  const qrUrl = useMemo(() => buildQrShareUrl(ad), [ad]);
  const isCheckout = variant === "checkout";

  return (
    <section
      className={isCheckout ? "checkout-card space-y-5" : "neo-card-white space-y-5"}
      aria-labelledby="share-tools-heading"
    >
      <div className="flex items-start gap-3">
        <span
          className={
            isCheckout
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-900 bg-amber-100 shadow-[2px_2px_0_0_#18181b]"
          }
        >
          <Share2 className="h-5 w-5 text-zinc-700" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2
            id="share-tools-heading"
            className={
              isCheckout
                ? "text-base font-semibold text-zinc-900 tracking-tight"
                : "text-display text-lg font-black uppercase"
            }
          >
            Divulgue offline e online
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-500 leading-snug">
            Cartaz A4 premium para imprimir ou card quadrado para redes sociais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AdPrintPoster
          ad={ad}
          qrUrl={qrUrl}
          triggerClassName={isCheckout ? "btn-share-print-soft" : "btn-share-print"}
        />
        <AdSocialCardDownload
          ad={ad}
          qrUrl={qrUrl}
          triggerClassName={isCheckout ? "btn-share-card-soft" : "btn-share-card"}
        />
      </div>
    </section>
  );
}
