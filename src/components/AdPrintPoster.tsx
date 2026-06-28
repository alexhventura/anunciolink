import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { isQrUrlSafe } from "../lib/qrShareUrl";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { BrandMark } from "./BrandMark";
import { ActionButtonWithHint } from "./HelpTooltip";
import { SITE_DOMAIN } from "../lib/constants";

const TYPE_LABEL: Record<AdData["t"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

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
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const qrSafe = isQrUrlSafe(qrUrl);

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
        className={triggerClassName}
        disabled={!qrSafe}
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Gerar Cartaz para Imprimir (A4)
      </ActionButtonWithHint>

      {qrSafe && (
        <div className="a4-poster" aria-hidden="true">
          <div className="a4-poster__sheet">
            <div className="a4-poster__frame">
              <header className="a4-poster__header">
                <BrandMark size="md" variant="soft" />
                <span className="a4-poster__chip">{TYPE_LABEL[ad.t]}</span>
              </header>

              <div className="a4-poster__banner">
                <h1 className="a4-poster__title">{ad.title}</h1>
              </div>

              <div className="a4-poster__photo-zone">
                {ad.img ? (
                  <img
                    src={ad.img}
                    alt={ad.title}
                    className="a4-poster__photo"
                    width={600}
                    height={600}
                  />
                ) : (
                  <div className="a4-poster__photo-placeholder">{ad.title}</div>
                )}
              </div>

              <footer className="a4-poster__base">
                <div className="a4-poster__price-box">
                  <span className="a4-poster__price-label">Preço</span>
                  <p className="a4-poster__price">{priceLabel}</p>
                </div>
                <div className="a4-poster__qr-block">
                  <div className="a4-poster__qr-wrap">
                    <QRCodeSVG
                      value={qrUrl}
                      size={200}
                      level="M"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#18181b"
                    />
                  </div>
                  <div className="a4-poster__cta">
                    <p className="a4-poster__cta-headline">Aponte a câmera do celular</p>
                    <p className="a4-poster__cta-body">
                      para ver detalhes e pagar via PIX ou Cartão!
                    </p>
                    <p className="a4-poster__domain">{SITE_DOMAIN}</p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
