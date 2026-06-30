import { Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdData } from "../types/ad";
import { printA4PosterDocument } from "../lib/a4PrintDocument";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint } from "./HelpTooltip";

interface AdPrintPosterProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

/** Cartaz A4 — janela dedicada com todos os dados do formulário */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [ad, qrUrl]);

  const handlePrint = useCallback(async () => {
    if (!qrSafe || printing) return;
    setPrinting(true);
    setError(null);
    try {
      await printA4PosterDocument(ad, qrUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível abrir a impressão.";
      setError(message);
    } finally {
      setPrinting(false);
    }
  }, [ad, qrSafe, printing, qrUrl]);

  return (
    <div className="space-y-2">
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.printPoster}
        hintVariant={hintVariant}
        onClick={() => void handlePrint()}
        id="btn-print-a4-poster"
        className={`${triggerClassName} no-print`}
        disabled={!qrSafe || printing}
        aria-busy={printing}
        aria-label="Gerar cartaz A4 para imprimir com QR Code em destaque"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {printing ? "Preparando cartaz…" : "Gerar Cartaz A4 para Imprimir"}
      </ActionButtonWithHint>
      {error ? (
        <p className="text-xs font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
