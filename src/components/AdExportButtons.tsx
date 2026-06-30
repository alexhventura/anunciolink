import { useCallback, useState } from "react";
import { ImageIcon, Printer } from "lucide-react";
import type { AdData } from "../types/ad";
import { printA4CardPdf } from "../lib/a4CardPdf";
import { exportJpgCard } from "../lib/shareImage";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint } from "./HelpTooltip";
import { IconActionButton } from "./IconActionButton";

interface AdExportButtonsProps {
  ad: AdData;
  qrUrl: string;
  compact?: boolean;
  iconsOnly?: boolean;
}

/** PDF e JPG — reutilizado em Meus Anúncios */
export function AdExportButtons({
  ad,
  qrUrl,
  compact = false,
  iconsOnly = false,
}: AdExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [jpgLoading, setJpgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdf = useCallback(async () => {
    if (!qrUrl.trim() || pdfLoading) return;
    setPdfLoading(true);
    setError(null);
    try {
      await printA4CardPdf(ad, qrUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  }, [ad, pdfLoading, qrUrl]);

  const handleJpg = useCallback(async () => {
    if (jpgLoading) return;
    setJpgLoading(true);
    setError(null);
    try {
      await exportJpgCard(ad, qrUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar JPG.");
    } finally {
      setJpgLoading(false);
    }
  }, [ad, jpgLoading, qrUrl]);

  if (iconsOnly) {
    return (
      <>
        <IconActionButton
          icon={Printer}
          label="Baixar cartaz A4 em PDF"
          hint={TOOLTIP_COPY.printPoster}
          onClick={() => void handlePdf()}
          disabled={!qrUrl.trim()}
          busy={pdfLoading}
        />
        <IconActionButton
          icon={ImageIcon}
          label="Baixar card em JPG"
          hint={TOOLTIP_COPY.socialCard}
          onClick={() => void handleJpg()}
          busy={jpgLoading}
        />
      </>
    );
  }

  const btnClass = compact
    ? "btn-ghost text-xs !py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
    : "share-channel share-channel--utility";

  return (
    <div className={compact ? "contents" : "share-channels__utilities"}>
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.printPoster}
        hintVariant="default"
        hintLayout={compact ? "below" : "overlay"}
        onClick={() => void handlePdf()}
        disabled={!qrUrl.trim() || pdfLoading}
        className={btnClass}
        aria-busy={pdfLoading}
        aria-label="Baixar cartaz A4 em PDF"
      >
        <Printer className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        {pdfLoading ? "PDF…" : "PDF"}
      </ActionButtonWithHint>

      <ActionButtonWithHint
        hint={TOOLTIP_COPY.socialCard}
        hintVariant="default"
        hintLayout={compact ? "below" : "overlay"}
        onClick={() => void handleJpg()}
        disabled={jpgLoading}
        className={btnClass}
        aria-busy={jpgLoading}
        aria-label="Baixar card em JPG"
      >
        <ImageIcon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        {jpgLoading ? "JPG…" : "JPG"}
      </ActionButtonWithHint>

      {error && !compact ? (
        <p className="share-channels__status share-channels__status--error col-span-full" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
