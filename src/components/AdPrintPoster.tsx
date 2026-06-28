import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
import { BrandMark } from "./BrandMark";
import { AdImage } from "./AdImage";
import { SITE_DOMAIN } from "../lib/constants";

const TYPE_LABEL: Record<AdData["t"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

interface AdPrintPosterProps {
  ad: AdData;
  adUrl: string;
  triggerClassName?: string;
}

export function AdPrintPoster({ ad, adUrl, triggerClassName = "btn-share-print" }: AdPrintPosterProps) {
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        id="btn-print-a4-poster"
        className={triggerClassName}
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
        Gerar Cartaz para Imprimir (A4)
      </button>

      <div className="a4-poster" aria-hidden="true">
        <div className="a4-poster__sheet">
          <header className="a4-poster__header">
            <BrandMark size="lg" className="a4-poster__brand !shadow-none" />
            <span className="a4-poster__chip">{TYPE_LABEL[ad.t]}</span>
          </header>

          <div className="a4-poster__title-banner">
            <h1 className="a4-poster__title">{ad.title}</h1>
          </div>

          <div className="a4-poster__hero">
            <div className="a4-poster__photo-frame">
              <AdImage
                src={ad.img}
                alt={ad.title}
                type={ad.t}
                title={ad.title}
                printMode={ad.printMode ?? true}
                className="a4-poster__photo"
              />
            </div>
            <div className="a4-poster__price-block">
              <span className="a4-poster__price-label">Preço</span>
              <p className="a4-poster__price">{priceLabel}</p>
            </div>
          </div>

          {ad.desc && (
            <p className="a4-poster__desc">{ad.desc.length > 280 ? `${ad.desc.slice(0, 277)}…` : ad.desc}</p>
          )}

          <footer className="a4-poster__footer">
            <div className="a4-poster__qr-wrap">
              <QRCodeSVG value={adUrl} size={168} level="M" includeMargin={false} bgColor="#ffffff" fgColor="#000000" />
            </div>
            <div className="a4-poster__cta">
              <p className="a4-poster__cta-headline">Aponte a câmera do celular</p>
              <p className="a4-poster__cta-body">
                para ver detalhes e pagar via PIX ou Cartão!
              </p>
              <p className="a4-poster__domain">{SITE_DOMAIN}</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
