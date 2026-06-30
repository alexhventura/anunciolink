import { Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdData } from "../types/ad";
import { printA4CardPdf } from "../lib/a4CardPdf";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint } from "./HelpTooltip";

interface AdPrintPosterProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

/** Cartaz A4 — PDF com a imagem do card redimensionada para folha A4 */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [ad, qrUrl]);

  const handlePrint = useCallback(async () => {
    if (!qrUrl.trim() || printing) return;
    setPrinting(true);
    setError(null);
    try {
      await printA4CardPdf(ad, qrUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível gerar o cartaz.";
      setError(message);
    } finally {
      setPrinting(false);
    }
  }, [ad, printing, qrUrl]);

  return (
    <div className="space-y-2">
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.printPoster}
        hintVariant={hintVariant}
        onClick={() => void handlePrint()}
        id="btn-print-a4-poster"
        className={`${triggerClassName} no-print`}
        disabled={!qrUrl.trim() || printing}
        aria-busy={printing}
        aria-label="Baixar cartaz A4 em PDF com a imagem do card"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {printing ? "Gerando PDF…" : "Baixar Cartaz A4 (PDF)"}
      </ActionButtonWithHint>
      {error ? (
        <p className="text-xs font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
