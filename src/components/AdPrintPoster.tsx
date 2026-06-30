import { Printer } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";
import type { AdData } from "../types/ad";
import { SITE_DOMAIN, SITE_NAME } from "../lib/constants";
import { getAdIconDefinition, resolveAdIconId } from "../lib/adIcons";
import { loadAdIcon } from "../lib/adIconLoaders";
import { formatPhoneNumber } from "../lib/formatters";
import { renderQrToCanvas } from "../lib/qrCanvas";
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

const POSTER_DESC_MAX = 320;

function summarizeDescription(text: string, maxLen = POSTER_DESC_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}

function Slot({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`a4-poster__slot ${className}`.trim()}>
      {children ?? <span className="a4-poster__slot-empty" aria-hidden="true" />}
    </div>
  );
}

/** Cartaz A4 — metade superior: produto; metade inferior: QR (slots fixos) */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const summary = summarizeDescription(ad.desc);
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const phoneLabel = ad.phone ? formatPhoneNumber(ad.phone) : "";

  useEffect(() => {
    const definition = getAdIconDefinition(resolveAdIconId(ad.icon, ad.t));
    const loader = definition ? loadAdIcon(definition.lucideKey) : undefined;
    if (loader) void loader();
  }, [ad.icon, ad.t]);

  useEffect(() => {
    if (!qrSafe) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    void renderQrToCanvas(qrUrl, 512).then((canvas) => {
      if (!cancelled) setQrDataUrl(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
  }, [qrUrl, qrSafe]);

  const handlePrint = () => {
    if (!qrDataUrl) return;
    document.documentElement.classList.add("printing-a4");
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.print();
        window.setTimeout(() => document.documentElement.classList.remove("printing-a4"), 500);
      }, 80);
    });
  };

  const poster =
    qrSafe &&
    createPortal(
      <div className="a4-poster" aria-hidden="true">
        <div className="a4-poster__sheet">
          <header className="a4-poster__brand">
            <span className="a4-poster__brand-name">{SITE_NAME}</span>
          </header>

          <section className="a4-poster__top" aria-label="Informações do anúncio">
            <Slot className="a4-poster__slot--icon">
              <div className="a4-poster__icon-well">
                <AdProductIcon iconId={ad.icon} adType={ad.t} size={52} strokeWidth={2.5} color="#18181b" />
              </div>
            </Slot>

            <Slot className="a4-poster__slot--type">
              <span className="a4-poster__chip">{TYPE_LABEL[ad.t]}</span>
            </Slot>

            <Slot className="a4-poster__slot--title">
              {ad.title ? <h1 className="a4-poster__title">{ad.title}</h1> : null}
            </Slot>

            <Slot className="a4-poster__slot--price">
              {ad.price ? <p className="a4-poster__price">{priceLabel}</p> : null}
            </Slot>

            <Slot className="a4-poster__slot--desc">
              {summary ? <p className="a4-poster__desc">{summary}</p> : null}
            </Slot>

            <div className="a4-poster__seller-row">
              <Slot className="a4-poster__slot--phone">
                {phoneLabel ? (
                  <p className="a4-poster__meta">
                    <span className="a4-poster__meta-label">WhatsApp</span>
                    <span className="a4-poster__meta-value">{phoneLabel}</span>
                  </p>
                ) : null}
              </Slot>
              <Slot className="a4-poster__slot--pix">
                {ad.pix ? (
                  <p className="a4-poster__meta">
                    <span className="a4-poster__meta-label">Pix</span>
                    <span className="a4-poster__meta-value">Disponível no anúncio online</span>
                  </p>
                ) : null}
              </Slot>
            </div>
          </section>

          <div className="a4-poster__rule" aria-hidden="true" />

          <section className="a4-poster__bottom" aria-label="QR Code">
            <h2 className="a4-poster__qr-heading">Escaneie o QR Code</h2>

            <Slot className="a4-poster__slot--qr">
              {qrDataUrl ? (
                <div className="a4-poster__qr-frame">
                  <img
                    src={qrDataUrl}
                    alt=""
                    className="a4-poster__qr-img"
                    width={512}
                    height={512}
                  />
                </div>
              ) : null}
            </Slot>

            <Slot className="a4-poster__slot--scan">
              <p className="a4-poster__scan-instruction">Abra o anúncio completo no celular.</p>
            </Slot>
          </section>

          <footer className="a4-poster__site-footer">{SITE_DOMAIN}</footer>
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
        disabled={!qrSafe || !qrDataUrl}
        aria-label="Gerar cartaz A4 para imprimir com QR Code em destaque"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Gerar Cartaz A4 para Imprimir
      </ActionButtonWithHint>

      {poster}
    </>
  );
}
