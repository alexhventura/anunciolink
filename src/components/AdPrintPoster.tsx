import { Printer } from "lucide-react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { resolveAdTheme } from "../lib/adThemes";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint } from "./HelpTooltip";
import { AdProductIcon } from "./AdProductIcon";

interface AdPrintPosterProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

const POSTER_DESC_MAX = 140;

function summarizeDescription(text: string, maxLen = POSTER_DESC_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}

/** Cartaz A4 dedicado — renderizado no body para impressão correta */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const themeDef = resolveAdTheme(ad.theme);
  const summary = summarizeDescription(ad.desc);
  const qrSize = 248;
  const logoSize = Math.round(qrSize * 0.22);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-a4");
    window.print();
    window.setTimeout(() => document.documentElement.classList.remove("printing-a4"), 500);
  };

  const poster =
    qrSafe &&
    createPortal(
      <div className="a4-poster" aria-hidden="true">
        <div className="a4-poster__sheet">
          <div className="a4-poster__brand-mark" aria-hidden="true">
            AnúncioLink
          </div>

          <main className="a4-poster__main">
            <div className="a4-poster__icon-frame">
              <AdProductIcon iconId={ad.icon} adType={ad.t} size={88} strokeWidth={2.5} color="#18181b" />
            </div>

            <h1 className="a4-poster__title">{ad.title}</h1>

            {summary && <p className="a4-poster__desc">{summary}</p>}

            <div className="a4-poster__qr-frame">
              <QRCodeSVG
                value={qrUrl}
                size={qrSize}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor={themeDef.qrFg}
                imageSettings={{
                  src: "/qr-logo.svg",
                  height: logoSize,
                  width: logoSize,
                  excavate: true,
                }}
              />
            </div>

            <p className="a4-poster__scan-instruction">Escaneie para abrir este anúncio.</p>
          </main>

          <footer className="a4-poster__footer">
            <p className="a4-poster__attribution">Gerado gratuitamente por AnúncioLink</p>
          </footer>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.printPoster}
        hintVariant={hintVariant}
        onClick={handlePrint}
        id="btn-print-a4-poster"
        className={`${triggerClassName} no-print`}
        disabled={!qrSafe}
        aria-label="Gerar cartaz A4 para imprimir com QR Code em destaque"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Gerar Cartaz A4 para Imprimir
      </ActionButtonWithHint>

      {poster}
    </>
  );
}
