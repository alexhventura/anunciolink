import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import type { AdThemeId } from "../types/ad";
import { resolveAdTheme } from "../lib/adThemes";
import { downloadQrPng } from "../lib/qrDownload";

const LazyQrCanvas = lazy(() =>
  import("./AdQrCanvas").then((m) => ({ default: m.AdQrCanvas }))
);

interface AdQrCodeSectionProps {
  url: string;
  theme?: AdThemeId;
  /** Adia render para não competir com AdSense no first paint */
  deferMs?: number;
  compact?: boolean;
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

/** QR Code com logo AnúncioLink + download PNG */
export function AdQrCodeSection({
  url,
  theme,
  deferMs = 120,
  compact = false,
}: AdQrCodeSectionProps) {
  const themeDef = resolveAdTheme(theme);
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

  const qrSize = compact ? 168 : 208;
  const logoSize = Math.round(qrSize * 0.22);

  return (
    <section className="ad-qr-section neo-card-white p-6 space-y-4" aria-label="QR Code do anúncio">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-black uppercase text-zinc-900">QR Code da página</h3>
        <p className="text-xs font-medium text-zinc-600">
          Escaneie para abrir esta landing page — ideal para impressão e vitrine física.
        </p>
      </div>

      <div className="flex justify-center">
        {ready ? (
          <Suspense fallback={<QrPlaceholder compact={compact} />}>
            <LazyQrCanvas
              ref={canvasRef}
              url={url}
              size={qrSize}
              fgColor={themeDef.qrFg}
              logoSize={logoSize}
            />
          </Suspense>
        ) : (
          <QrPlaceholder compact={compact} />
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={!ready || downloading}
        id="btn-download-qr-png"
        className="btn-accent w-full gap-2"
        aria-busy={downloading}
        aria-label="Baixar QR Code em PNG"
      >
        <Download className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {downloading ? "Salvando…" : "Baixar QR Code (PNG)"}
      </button>
    </section>
  );
}
