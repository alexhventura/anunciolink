import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { AD_QR_FOREGROUND } from "../lib/adThemes";
import { downloadQrPng } from "../lib/qrDownload";

const LazyQrCanvas = lazy(() =>
  import("./AdQrCanvas").then((m) => ({ default: m.AdQrCanvas }))
);

interface AdQrCodeSectionProps {
  url: string;
  /** Adia render para não competir com AdSense no first paint */
  deferMs?: number;
  compact?: boolean;
  /** Estilo secundário na landing do comprador */
  landing?: boolean;
  headingId?: string;
}

function QrPlaceholder({ compact }: { compact?: boolean }) {
  const size = compact ? 160 : 200;
  return (
    <div
      className="ad-qr-section__placeholder"
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
    >
      <span className="text-xs font-bold text-zinc-500">Gerando QR…</span>
    </div>
  );
}

/** QR Code com favicon AnúncioLink + download PNG */
export function AdQrCodeSection({
  url,
  deferMs = 120,
  compact = false,
  landing = false,
  headingId,
}: AdQrCodeSectionProps) {
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(() => window.setTimeout(mount, deferMs));
      return () => {
        cancelled = true;
        cancelIdleCallback(idleId);
      };
    }

    const timerId = window.setTimeout(mount, deferMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [deferMs, url]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      await downloadQrPng(canvas, "anunciolink-qrcode.png");
    } finally {
      setDownloading(false);
    }
  }, []);

  const qrSize = compact || landing ? 168 : 208;
  const logoSize = Math.round(qrSize * 0.22);

  return (
    <section
      className={`ad-qr-section neo-card-white ${landing ? "ad-qr-section--landing" : ""}`}
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : "QR Code do anúncio"}
    >
      <header className="ad-landing-section__header ad-landing-section__header--center">
        <h2 id={headingId} className="ad-landing-section__title ad-landing-section__title--sm">
          Compartilhar esta página
        </h2>
        <p className="ad-landing-section__lead ad-landing-section__lead--center">
          QR Code para vitrine, impressão ou enviar o link por outro canal.
        </p>
      </header>

      <div className="flex justify-center">
        {ready ? (
          <Suspense fallback={<QrPlaceholder compact={compact} />}>
            <LazyQrCanvas
              ref={canvasRef}
              url={url}
              size={qrSize}
              fgColor={AD_QR_FOREGROUND}
              logoSize={logoSize}
            />
          </Suspense>
        ) : (
          <QrPlaceholder compact={compact} />
        )}
      </div>

      <div className="ad-qr-section__actions">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={!ready || downloading}
          id="btn-download-qr-png"
          className="ad-landing-cta btn-accent w-full gap-2"
          aria-busy={downloading}
          aria-label="Baixar QR Code em PNG"
        >
          <Download className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
          {downloading ? "Salvando…" : "Baixar QR Code (PNG)"}
        </button>
      </div>
    </section>
  );
}
