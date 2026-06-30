import type { AdData } from "../types/ad";

export type ExportQrMode = "pix" | "ad";

const MIN_PIX_LENGTH = 20;

/** QR do rodapé: Pix quando disponível, senão link do anúncio */
export function resolveExportQr(
  ad: AdData,
  adUrl: string
): { value: string; mode: ExportQrMode } {
  const pix = ad.pix?.trim();
  if (pix && pix.length >= MIN_PIX_LENGTH) {
    return { value: pix, mode: "pix" };
  }
  return { value: adUrl.trim(), mode: "ad" };
}
