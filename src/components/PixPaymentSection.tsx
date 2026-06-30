import { useMemo } from "react";
import { Copy, QrCode } from "lucide-react";
import { PixQrCodeLazy } from "./PixQrCodeLazy";

interface PixPaymentSectionProps {
  pixCode: string;
  copied: boolean;
  onCopy: () => void;
  layout?: "full" | "split";
  /** Destaque como ação principal na landing */
  primary?: boolean;
}

/** QR Pix + botão copiar — exibidos juntos sempre que houver código Pix */
export function PixPaymentSection({
  pixCode,
  copied,
  onCopy,
  layout = "full",
  primary = false,
}: PixPaymentSectionProps) {
  const qrSize = useMemo(() => (layout === "split" ? 168 : 200), [layout]);
  const pixBtnClass = copied ? "btn-payment-pix-copied" : "btn-payment-pix";

  return (
    <div className={`pix-payment ${primary ? "pix-payment--primary" : ""}`}>
      <div className="pix-payment__qr-block" aria-labelledby="pix-qr-heading">
        <p id="pix-qr-heading" className="pix-payment__qr-label">
          <QrCode className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          Pague com Pix
        </p>
        <p className="pix-payment__qr-sub">Escaneie o QR Code no app do seu banco</p>
        <div
          className="pix-payment__qr-wrap mx-auto"
          style={{ width: qrSize + 24, height: qrSize + 24 }}
        >
          <PixQrCodeLazy pixCode={pixCode} size={qrSize} />
        </div>
      </div>

      <button
        type="button"
        onClick={onCopy}
        id={layout === "split" ? "btn-buyer-pix-split" : "btn-buyer-pix-full"}
        aria-live="polite"
        aria-pressed={copied}
        aria-label={copied ? "Código Pix copiado para a área de transferência" : "Copiar código Pix copia e cola"}
        className={`ad-landing-cta ${pixBtnClass} w-full ${primary ? "ad-landing-cta--primary" : ""}`}
      >
        <Copy className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        {copied ? "Código Pix copiado" : "Copiar código Pix"}
      </button>
    </div>
  );
}
