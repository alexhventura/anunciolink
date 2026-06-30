import { Share2 } from "lucide-react";
import { useMemo } from "react";
import type { AdData } from "../types/ad";
import { buildQrShareUrl } from "../lib/qrShareUrl";
import { AdPrintPoster } from "./AdPrintPoster";
import { AdSocialCardDownload } from "./AdSocialCardDownload";

interface AdShareToolsProps {
  ad: AdData;
  /** Link gerado (inclui locked.) — QR do card e cartaz usam este URL quando informado */
  shareUrl?: string;
}

export function AdShareTools({ ad, shareUrl }: AdShareToolsProps) {
  const qrUrl = useMemo(() => shareUrl ?? buildQrShareUrl(ad), [ad, shareUrl]);

  return (
    <section className="neo-card-white space-y-5" aria-labelledby="share-tools-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-900 bg-amber-100 shadow-[2px_2px_0_0_#18181b]">
          <Share2 className="h-5 w-5 text-zinc-700" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 id="share-tools-heading" className="text-display text-lg font-black uppercase">
            Divulgue offline e online
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-500 leading-snug">
            Card quadrado com QR Code ou panfleto A4 — disponível após gerar o link.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AdPrintPoster ad={ad} qrUrl={qrUrl} triggerClassName="btn-share-print" hintVariant="on-dark" />
        <AdSocialCardDownload ad={ad} qrUrl={qrUrl} triggerClassName="btn-share-card" hintVariant="default" />
      </div>
    </section>
  );
}
