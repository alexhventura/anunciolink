import {
  SITE_QR_LOGO_RATIO,
  SITE_QR_LOGO_SRC,
  SITE_QR_MARGIN_COLOR,
  SITE_QR_MARGIN_SIZE,
} from "./constants";

export function getQrLogoSize(qrSize: number): number {
  return Math.round(qrSize * SITE_QR_LOGO_RATIO);
}

export function getQrImageSettings(qrSize: number) {
  const logoSize = getQrLogoSize(qrSize);
  return {
    src: SITE_QR_LOGO_SRC,
    height: logoSize,
    width: logoSize,
    excavate: true,
    crossOrigin: "anonymous" as const,
  };
}

export const QR_CANVAS_MARGIN = {
  includeMargin: true as const,
  bgColor: SITE_QR_MARGIN_COLOR,
  marginSize: SITE_QR_MARGIN_SIZE,
};
