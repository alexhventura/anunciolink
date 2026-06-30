import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { resolveAdTheme } from "../lib/adThemes";
import { formatPhoneNumber } from "../lib/formatters";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint } from "./HelpTooltip";

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

/** Cartaz A4 — QR Code como elemento central; sem card completo na impressão */
export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const themeDef = resolveAdTheme(ad.theme);
  const phoneDisplay = ad.phone ? formatPhoneNumber(ad.phone) : "";
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const qrSize = 268;
  const logoSize = Math.round(qrSize * 0.22);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-a4");
    window.print();
    window.setTimeout(() => document.documentElement.classList.remove("printing-a4"), 500);
  };

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

      {qrSafe && (
        <div className="a4-poster" aria-hidden="true">
          <div className="a4-poster__sheet">
            <header className="a4-poster__header">
              <span className="a4-poster__site">AnúncioLink</span>
              <span className="a4-poster__chip">{TYPE_LABEL[ad.t]}</span>
            </header>

            <main className="a4-poster__main">
              <p className="a4-poster__scan-label">Escaneie com a câmera do celular</p>

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

              <div className="a4-poster__info">
                <h1 className="a4-poster__title">{ad.title}</h1>
                <p className="a4-poster__price">{priceLabel}</p>
                {phoneDisplay && (
                  <p className="a4-poster__phone">{phoneDisplay}</p>
                )}
              </div>
            </main>

            <footer className="a4-poster__footer">
              <p className="a4-poster__hint">
                Abra o link, veja detalhes completos e pague via Pix ou cartão.
              </p>
              <p className="a4-poster__brand">www.anunciolink.com.br</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
