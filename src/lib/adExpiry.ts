import type { AdData } from "../types/ad";

export const AD_VEICULATION_DAYS = 30;
const MS_PER_DAY = 86_400_000;

/** Data de expiração padrão: agora + 30 dias (Unix ms) */
export function computeExpiresAt(fromMs = Date.now()): number {
  return fromMs + AD_VEICULATION_DAYS * MS_PER_DAY;
}

/** Resolve expiração do anúncio — usa `expiresAt` na URL ou infere de `timestamp` (legado) */
export function resolveAdExpiresAt(ad: AdData): number {
  if (ad.expiresAt && Number.isFinite(ad.expiresAt)) return ad.expiresAt;
  const created = ad.timestamp && Number.isFinite(ad.timestamp) ? ad.timestamp : Date.now();
  return computeExpiresAt(created);
}

export function isAdExpired(ad: AdData, now = Date.now()): boolean {
  return now > resolveAdExpiresAt(ad);
}

export const AD_EXPIRED_BANNER_COPY =
  "Este anúncio atingiu o limite padrão de 30 dias de veiculação e foi pausado pelo vendedor. Mas não se preocupe! Você pode criar um anúncio idêntico agora mesmo.";
