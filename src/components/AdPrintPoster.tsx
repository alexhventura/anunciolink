import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdData } from "../types/ad";
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
        aria-label="Gerar cartaz A4 para imprimir com o mesmo visual do anúncio"
      >
        <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Gerar Cartaz para Imprimir (A4)
      </ActionButtonWithHint>

      {qrSafe && (
        <div className="a4-poster" aria-hidden="true">
          <div className="a4-poster__sheet">
            <div className="a4-poster__card-wrap">
              <AdPreviewCard
                adType={ad.t}
                title={ad.title}
                price={ad.price}
                description={ad.desc}
                image={ad.img}
                billingType={ad.billingType}
                showPhotoCaption={false}
                showSecurityBadge
              />
            </div>

            <div className="a4-poster__scan-row">
              <div className="a4-poster__qr-wrap">
                <QRCodeSVG
                  value={qrUrl}
                  size={160}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#18181b"
                />
              </div>
              <div className="a4-poster__scan-copy">
                <p className="a4-poster__scan-title">Aponte a câmera do celular</p>
                <p className="a4-poster__scan-body">
                  para ver o anúncio completo e pagar via Pix ou cartão — igual ao link do WhatsApp.
                </p>
              </div>
            </div>

            <p className="a4-poster__brand">Anunciado em: www.anunciolink.com.br</p>
          </div>
        </div>
      )}
    </>
  );
}
