import type { AdData } from "../types/ad";
import { getAdAnalyticsId } from "./adAnalytics";

const OWNER_KEY_PREFIX = "dono_anuncio_";

function ownerKey(adId: string): string {
  return `${OWNER_KEY_PREFIX}${adId}`;
}

/** Marca o criador como dono deste anúncio no dispositivo atual */
export function markAdOwner(ad: AdData): void {
  try {
    const adId = getAdAnalyticsId(ad);
    localStorage.setItem(ownerKey(adId), "true");
  } catch {
    /* localStorage indisponível — ignora */
  }
}

/** Verifica se quem está acessando é o criador (mesmo aparelho/navegador) */
export function isAdOwner(ad: AdData): boolean {
  try {
    const adId = getAdAnalyticsId(ad);
    return localStorage.getItem(ownerKey(adId)) === "true";
  } catch {
    return false;
  }
}
