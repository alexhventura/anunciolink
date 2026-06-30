import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { AD_QR_FOREGROUND } from "../lib/adThemes";
import { copyToClipboard } from "../lib/formatters";
import { downloadQrPng } from "../lib/qrDownload";

const LazyQrCanvas = lazy(() =>
  import("./AdQrCanvas").then((m) => ({ default: m.AdQrCanvas }))
);

interface AdLandingOfflineShareProps {
  url: string;
  headingId?: string;
}

function QrPlaceholder() {
  return (
    <div className="ad-offline-share__qr-placeholder" role="status" aria-live="polite">
      <span className="text-[10px] font-bold text-zinc-500">Gerando QR…</span>
    </div>
  );
}

/** Na landing do comprador: copiar link em destaque; QR discreto para vitrine física */
export function AdLandingOfflineShare({ url, headingId }: AdLandingOfflineShareProps) {
  const fallbackHeadingId = useId();
  const resolvedHeadingId = headingId ?? fallbackHeadingId;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) setCopied(true);
  };

  const handleDownloadQr = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      await downloadQrPng(canvas, "anunciolink-qrcode.png");
    } finally {
      setDownloading(false);
    }
  };

  const qrSize = 128;

  return (
    <section
      className="ad-offline-share neo-card-muted"
      aria-labelledby={resolvedHeadingId}
    >
      <header className="ad-offline-share__header">
        <h2 id={resolvedHeadingId} className="ad-offline-share__title">
          Salvar link do anúncio
        </h2>
        <p className="ad-offline-share__lead">
          Você já está nesta página. Copie o endereço para enviar por mensagem.
        </p>
      </header>

      <button
        type="button"
        onClick={() => void handleCopy()}
        id="btn-copy-landing-url"
        className="ad-landing-cta btn-accent w-full gap-2"
        aria-live="polite"
        aria-label={copied ? "Link copiado" : "Copiar link desta página"}
      >
        {copied ? (
          <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Copy className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        )}
        {copied ? "Link copiado!" : "Copiar link"}
      </button>

      <details className="ad-offline-share__details">
        <summary className="ad-offline-share__summary">
          <QrCode className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          <span>QR para vitrine ou impressão física</span>
        </summary>
        <div className="ad-offline-share__qr-panel">
          <p className="ad-offline-share__qr-hint">
            Use em cartaz, balcão ou etiqueta — para quem está sem o link no celular.
          </p>
          <div className="ad-offline-share__qr">
            <Suspense fallback={<QrPlaceholder />}>
              <LazyQrCanvas
                ref={canvasRef}
                url={url}
                size={qrSize}
                fgColor={AD_QR_FOREGROUND}
              />
            </Suspense>
          </div>
          <button
            type="button"
            onClick={() => void handleDownloadQr()}
            disabled={downloading}
            id="btn-download-landing-qr"
            className="ad-landing-cta btn-ghost w-full !min-h-[48px] !text-xs"
            aria-busy={downloading}
            aria-label="Baixar QR Code em PNG"
          >
            {downloading ? "Salvando…" : "Baixar QR (PNG)"}
          </button>
        </div>
      </details>
    </section>
  );
}
