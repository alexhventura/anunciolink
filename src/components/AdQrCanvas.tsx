import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getQrImageSettings, QR_CANVAS_MARGIN } from "../lib/qrImageSettings";

interface AdQrCanvasProps {
  url: string;
  size: number;
  fgColor: string;
}

/** Canvas do QR — favicon central + margens mostarda (carregado sob demanda) */
export const AdQrCanvas = forwardRef<HTMLCanvasElement, AdQrCanvasProps>(function AdQrCanvas(
  { url, size, fgColor },
  ref
) {
  return (
    <div className="ad-qr-section__wrap">
      <QRCodeCanvas
        ref={ref}
        value={url}
        size={size}
        level="H"
        fgColor={fgColor}
        {...QR_CANVAS_MARGIN}
        imageSettings={getQrImageSettings(size)}
        aria-label="QR Code AnúncioLink com favicon"
      />
    </div>
  );
});
