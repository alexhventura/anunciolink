import { Printer } from "lucide-react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { SITE_DOMAIN } from "../lib/constants";
import { AD_QR_FOREGROUND } from "../lib/adThemes";
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

const TYPE_LABEL = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
} as const;

const POSTER_DESC_MAX = 200;
const QR_SIZE = 196;

function summarizeDescription(text: string, maxLen = POSTER_DESC_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}

/** Cartaz A4 — layout do card do anúncio + QR centralizado */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const summary = summarizeDescription(ad.desc);
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const logoSize = Math.round(QR_SIZE * 0.22);

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
          <div className="a4-poster__stage">
            <article className="a4-poster__card">
              <header className="a4-poster__hero">
                <div className="a4-poster__icon-well">
                  <AdProductIcon iconId={ad.icon} adType={ad.t} size={72} strokeWidth={2.5} color="#18181b" />
                </div>
                <h1 className="a4-poster__title">{ad.title}</h1>
                <p className="a4-poster__price">{priceLabel}</p>
              </header>

              <section className="a4-poster__body">
                <span className="a4-poster__chip">{TYPE_LABEL[ad.t]}</span>
                {summary && <p className="a4-poster__desc">{summary}</p>}
              </section>

              <footer className="a4-poster__qr-panel">
                <div className="a4-poster__qr-frame">
                  <QRCodeSVG
                    value={qrUrl}
                    size={QR_SIZE}
                    level="H"
                    includeMargin
                    marginSize={3}
                    bgColor="#ffffff"
                    fgColor={AD_QR_FOREGROUND}
                    imageSettings={{
                      src: "/qr-logo.svg",
                      height: logoSize,
                      width: logoSize,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="a4-poster__scan-instruction">Escaneie para abrir este anúncio.</p>
              </footer>
            </article>

            <p className="a4-poster__site-footer">{SITE_DOMAIN}</p>
          </div>
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
