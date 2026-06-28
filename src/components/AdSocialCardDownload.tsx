import { useCallback, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { AdData } from "../types/ad";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { downloadBlob, renderSocialCard, slugifyFilename } from "../lib/socialCardRenderer";
import { ActionButtonWithHint } from "./HelpTooltip";

const TYPE_LABEL: Record<AdData["t"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

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
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrSafe = useMemo(() => isQrUrlSafe(qrUrl), [qrUrl]);

  const handleDownload = useCallback(async () => {
    const qrCanvas = qrRef.current;
    if (!qrCanvas || !qrSafe) {
      setError("QR Code indisponível. Reduza o texto do anúncio e tente novamente.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const blob = await renderSocialCard({
        title: ad.title,
        price: ad.price,
        imageSrc: ad.img,
        adUrl: qrUrl,
        qrCanvas,
        billingRecorrente: ad.billingType === "recorrente",
        typeLabel: TYPE_LABEL[ad.t],
      });

      downloadBlob(blob, `anunciolink-${slugifyFilename(ad.title)}.png`);
    } catch {
      setError("Não foi possível gerar o card. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, [ad, qrUrl, qrSafe]);

  return (
    <>
      {qrSafe && (
        <div className="sr-only" aria-hidden="true">
          <QRCodeCanvas
            ref={qrRef}
            value={qrUrl}
            size={256}
            level="M"
            marginSize={1}
            bgColor="#ffffff"
            fgColor="#18181b"
          />
        </div>
      )}

      <ActionButtonWithHint
        hint={TOOLTIP_COPY.socialCard}
        hintVariant={hintVariant}
        onClick={handleDownload}
        disabled={generating || !qrSafe}
        id="btn-download-social-card"
        className={triggerClassName}
        aria-busy={generating}
      >
        <Download className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {generating ? "Gerando card…" : "Baixar Card para Postagem"}
      </ActionButtonWithHint>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 text-center">
          {error}
        </p>
      )}
      {!qrSafe && !error && (
        <p className="text-xs font-medium text-zinc-500 text-center">
          Anúncio muito longo para QR Code. Encurte a descrição ou o Pix.
        </p>
      )}
    </>
  );
}
