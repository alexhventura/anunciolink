import type { AdData } from "../types/ad";

export type ExportQrMode = "pix" | "ad";
export type ExportQrPreference = ExportQrMode;

const MIN_PIX_LENGTH = 20;

export function hasPixQr(ad: AdData): boolean {
  const pix = ad.pix?.trim();
  return Boolean(pix && pix.length >= MIN_PIX_LENGTH);
}

/** Resolve QR do cartaz conforme escolha do usuário */
export function resolveExportQr(
  ad: AdData,
  adUrl: string,
  preference: ExportQrPreference = "ad"
): { value: string; mode: ExportQrMode } {
  if (preference === "pix") {
    const pix = ad.pix?.trim();
    if (pix && pix.length >= MIN_PIX_LENGTH) {
      return { value: pix, mode: "pix" };
    }
  }
  return { value: adUrl.trim(), mode: "ad" };
}
