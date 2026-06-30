import type { AdData } from "../types/ad";
import { AdSerializer, QR_MAX_URL_CHARS } from "./adSerializer";

export { QR_MAX_URL_CHARS };

/** @deprecated Use AdSerializer.buildQrUrl */
export function buildQrShareUrl(ad: AdData): string {
  return AdSerializer.buildQrUrl(ad);
}

/** @deprecated Use AdSerializer.isQrUrlSafe */
export function isQrUrlSafe(url: string): boolean {
  return AdSerializer.isQrUrlSafe(url);
}
