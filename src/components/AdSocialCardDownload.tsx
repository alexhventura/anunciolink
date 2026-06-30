import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import type { AdData } from "../types/ad";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { generateShareCardBlob, shareCardFilename } from "../lib/shareImage";
import { downloadBlob } from "../lib/socialCardRenderer";
import { ActionButtonWithHint } from "./HelpTooltip";

interface AdSocialCardDownloadProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

export function AdSocialCardDownload({
  ad,
  qrUrl,
  triggerClassName = "btn-share-card",
  hintVariant = "default",
}: AdSocialCardDownloadProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const blob = await generateShareCardBlob(ad, qrUrl);
      downloadBlob(blob, shareCardFilename(ad));
    } catch {
      setError("Não foi possível gerar o card. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, [ad, qrUrl]);

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
        aria-label="Baixar card idêntico ao anúncio com QR Code para postagem"
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
