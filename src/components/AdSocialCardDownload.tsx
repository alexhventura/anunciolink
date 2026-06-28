import { useCallback, useRef, useState } from "react";
import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { AdData } from "../types/ad";
import { downloadBlob, renderSocialCard, slugifyFilename } from "../lib/socialCardRenderer";

const TYPE_LABEL: Record<AdData["t"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

interface AdSocialCardDownloadProps {
  ad: AdData;
  adUrl: string;
  triggerClassName?: string;
}

export function AdSocialCardDownload({
  ad,
  adUrl,
  triggerClassName = "btn-share-card",
}: AdSocialCardDownloadProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    const qrCanvas = qrRef.current;
    if (!qrCanvas) {
      setError("QR Code indisponível. Tente novamente.");
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
        adUrl,
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
  }, [ad, adUrl]);

  return (
    <>
      <div className="sr-only" aria-hidden="true">
        <QRCodeCanvas
          ref={qrRef}
          value={adUrl}
          size={256}
          level="M"
          marginSize={1}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={generating}
        id="btn-download-social-card"
        className={triggerClassName}
        aria-busy={generating}
      >
        <Download className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
        {generating ? "Gerando card…" : "Baixar Card para Postagem"}
      </button>

      {error && (
        <p role="alert" className="text-xs font-bold text-red-700 text-center">
          {error}
        </p>
      )}
    </>
  );
}
