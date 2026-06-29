import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import type { AdData } from "../types/ad";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { renderPreviewCardBlob } from "../lib/adPreviewCardCanvas";
import { downloadBlob, slugifyFilename } from "../lib/socialCardRenderer";
import { ActionButtonWithHint } from "./HelpTooltip";

interface AdSocialCardDownloadProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

export function AdSocialCardDownload({
  ad,
  triggerClassName = "btn-share-card",
  hintVariant = "default",
}: AdSocialCardDownloadProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const blob = await renderPreviewCardBlob({
        adType: ad.t,
        title: ad.title,
        price: ad.price,
        description: ad.desc,
        imageSrc: ad.img,
        crop: ad.crop,
        billingRecorrente: ad.billingType === "recorrente",
        width: 1080,
      });

      downloadBlob(blob, `anunciolink-${slugifyFilename(ad.title)}.png`);
    } catch {
      setError("Não foi possível gerar o card. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, [ad]);

  return (
    <>
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.socialCard}
        hintVariant={hintVariant}
        onClick={handleDownload}
        disabled={generating}
        id="btn-download-social-card"
        className={triggerClassName}
        aria-busy={generating}
        aria-label="Baixar card idêntico ao anúncio para postagem"
      >
        <Download className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {generating ? "Gerando card…" : "Baixar Card para Postagem"}
      </ActionButtonWithHint>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 text-center">
          {error}
        </p>
      )}
    </>
  );
}
