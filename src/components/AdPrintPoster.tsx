import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { resolveAdTheme } from "../lib/adThemes";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { AdPreviewCard } from "./AdPreviewCard";
import { ActionButtonWithHint } from "./HelpTooltip";

interface AdPrintPosterProps {
  ad: AdData;
  qrUrl: string;
  triggerClassName?: string;
  hintVariant?: "default" | "on-dark";
}

export function AdPrintPoster({
  ad,
  qrUrl,
  triggerClassName = "btn-share-print",
  hintVariant = "on-dark",
}: AdPrintPosterProps) {
  const qrSafe = isQrUrlSafe(qrUrl);
  const themeDef = resolveAdTheme(ad.theme);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-a4");
    window.print();
    window.setTimeout(() => document.documentElement.classList.remove("printing-a4"), 500);
  };

  const qrSlot = (
    <div className="ad-preview-card__qr">
      <QRCodeSVG
        value={qrUrl}
        size={140}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor={themeDef.qrFg}
        imageSettings={{
          src: "/qr-logo.svg",
          height: 32,
          width: 32,
          excavate: true,
        }}
        aria-label="QR Code do anúncio"
      />
      <p className="ad-preview-card__qr-label">Escaneie para ver o anúncio completo</p>
    </div>
  );

  return (
    <>
      <ActionButtonWithHint
        hint={TOOLTIP_COPY.printPoster}
        hintVariant={hintVariant}
        onClick={handlePrint}
        id="btn-print-a4-poster"
        className={triggerClassName}
        disabled={!qrSafe}
        aria-label="Gerar panfleto A4 para imprimir com identidade do card"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Gerar Panfleto A4 para Imprimir
      </ActionButtonWithHint>

      {qrSafe && (
        <div className="a4-poster" aria-hidden="true">
          <div className="a4-poster__sheet">
            <header className="a4-poster__header">
              <span className="a4-poster__site">AnúncioLink</span>
              <span className="a4-poster__chip">
                {ad.t === "venda" ? "Venda" : ad.t === "servico" ? "Serviço" : "Vaquinha"}
              </span>
            </header>

            <div className="a4-poster__card-wrap">
              <AdPreviewCard
                adType={ad.t}
                title={ad.title}
                price={ad.price}
                description={ad.desc}
                icon={ad.icon}
                theme={ad.theme}
                billingType={ad.billingType}
                phone={ad.phone}
                showSecurityBadge
                exportMode
                qrSlot={qrSlot}
                premium
              />
            </div>

            <footer className="a4-poster__footer">
              <p className="a4-poster__brand">www.anunciolink.com.br</p>
              <p className="a4-poster__hint">Aponte a câmera do celular no QR Code para pagar via Pix ou cartão.</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
