import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { SITE_QR_LOGO_SRC } from "../lib/constants";

interface AdQrCanvasProps {
  url: string;
  size: number;
  fgColor: string;
  logoSize: number;
}

/** Canvas do QR — carregado sob demanda (code-split) */
export const AdQrCanvas = forwardRef<HTMLCanvasElement, AdQrCanvasProps>(function AdQrCanvas(
  { url, size, fgColor, logoSize },
  ref
) {
  return (
    <div className="ad-qr-section__wrap">
      <QRCodeCanvas
        ref={ref}
        value={url}
        size={size}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor={fgColor}
        marginSize={2}
        imageSettings={{
          src: SITE_QR_LOGO_SRC,
          height: logoSize,
          width: logoSize,
          excavate: true,
          crossOrigin: "anonymous",
        }}
        aria-label="QR Code AnúncioLink"
      />
    </div>
  );
});
