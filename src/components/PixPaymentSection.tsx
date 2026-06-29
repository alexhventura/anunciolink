import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";

interface PixPaymentSectionProps {
  pixCode: string;
  copied: boolean;
  onCopy: () => void;
  layout?: "full" | "split";
}

/** QR Pix + botão copiar — exibidos juntos sempre que houver código Pix */
export function PixPaymentSection({
  pixCode,
  copied,
  onCopy,
  layout = "full",
}: PixPaymentSectionProps) {
  const qrSize = useMemo(() => (layout === "split" ? 168 : 200), [layout]);
  const pixBtnClass = copied ? "btn-payment-pix-copied" : "btn-payment-pix";

  return (
    <div className="pix-payment space-y-4">
      <div className="pix-payment__qr-block">
        <p className="pix-payment__qr-label">Pague com Pix — escaneie o QR Code</p>
        <div
          className="pix-payment__qr-wrap mx-auto"
          style={{ width: qrSize + 24, height: qrSize + 24 }}
        >
          <QRCodeSVG
            value={pixCode}
            size={qrSize}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#18181b"
            aria-label="QR Code Pix para pagamento"
          />
        </div>
        <p className="pix-payment__qr-hint text-xs font-medium text-zinc-600 text-center">
          Abra o app do banco, escaneie e confirme o pagamento
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        id={layout === "split" ? "btn-buyer-pix-split" : "btn-buyer-pix-full"}
        aria-live="polite"
        aria-label={copied ? "Código Pix copiado" : "Copiar código Pix copia e cola"}
        className={`${pixBtnClass} w-full`}
      >
        {copied ? "✓ Código Pix copiado" : "Copiar código Pix"}
      </button>
    </div>
  );
}
