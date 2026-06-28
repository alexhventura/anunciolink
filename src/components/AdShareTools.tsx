import { Share2 } from "lucide-react";
import type { AdData } from "../types/ad";
import { AdPrintPoster } from "./AdPrintPoster";
import { AdSocialCardDownload } from "./AdSocialCardDownload";

interface AdShareToolsProps {
  ad: AdData;
  adUrl: string;
}

export function AdShareTools({ ad, adUrl }: AdShareToolsProps) {
  return (
    <section className="neo-card-white space-y-5" aria-labelledby="share-tools-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-[3px] border-black bg-lime-300 neo-shadow-sm">
          <Share2 className="h-5 w-5 text-black" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div>
          <h2 id="share-tools-heading" className="text-display text-lg font-black uppercase">
            Divulgue offline e online
          </h2>
          <p className="mt-1 text-xs font-bold text-zinc-700 leading-snug">
            Cartaz A4 para imprimir ou card quadrado pronto para Instagram e WhatsApp Status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AdPrintPoster ad={ad} adUrl={adUrl} />
        <AdSocialCardDownload ad={ad} adUrl={adUrl} />
      </div>
    </section>
  );
}
