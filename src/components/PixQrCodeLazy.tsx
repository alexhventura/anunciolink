import { lazy, Suspense } from "react";

interface PixQrCodeProps {
  pixCode: string;
  size: number;
}

const LazyPixQrCode = lazy(async () => {
  const { QRCodeSVG } = await import("qrcode.react");
  return {
    default: function PixQrCode({ pixCode, size }: PixQrCodeProps) {
      return (
        <QRCodeSVG
          value={pixCode}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#18181b"
          aria-label="QR Code Pix para pagamento"
          role="img"
        />
      );
    },
  };
});

export function PixQrCodeLazy(props: PixQrCodeProps) {
  return (
    <Suspense
      fallback={
        <div
          className="pix-payment__qr-skeleton"
          style={{ width: props.size, height: props.size }}
          aria-hidden="true"
        />
      }
    >
      <LazyPixQrCode {...props} />
    </Suspense>
  );
}
