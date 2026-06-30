import type { AdData, AdType } from "../types/ad";

export const AD_VEICULATION_DAYS = 30;
const MS_PER_DAY = 86_400_000;

/** Apenas anúncios de venda expiram — serviços e vaquinhas permanecem ativos */
export function adTypeExpires(adType: AdType): boolean {
  return adType === "venda";
}

/** Data de expiração padrão para vendas: agora + 30 dias (Unix ms) */
export function computeExpiresAt(fromMs = Date.now(), adType: AdType = "venda"): number | undefined {
  if (!adTypeExpires(adType)) return undefined;
  return fromMs + AD_VEICULATION_DAYS * MS_PER_DAY;
}

/** Resolve expiração do anúncio — usa `expiresAt` na URL ou infere de `timestamp` (legado) */
export function resolveAdExpiresAt(ad: AdData): number | undefined {
  if (!adTypeExpires(ad.t)) return undefined;
  if (ad.expiresAt && Number.isFinite(ad.expiresAt)) return ad.expiresAt;
  const created = ad.timestamp && Number.isFinite(ad.timestamp) ? ad.timestamp : Date.now();
  return computeExpiresAt(created, "venda");
}

export function isAdExpired(ad: AdData, now = Date.now()): boolean {
  const expiresAt = resolveAdExpiresAt(ad);
  if (expiresAt === undefined) return false;
  return now > expiresAt;
}

export const AD_EXPIRED_BANNER_COPY =
  "Este anúncio de venda atingiu o limite padrão de 30 dias de veiculação e foi pausado pelo vendedor. Mas não se preocupe! Você pode criar um anúncio idêntico agora mesmo.";
