import type { AdData } from "../types/ad";
import { buildAdHashPayload, buildAdUrl, encodeAdData } from "./adCodec";

/** Limite seguro para QR Code nível M (evita RangeError: Data too long) */
export const QR_MAX_URL_CHARS = 900;

function urlForAd(ad: AdData): string {
  return buildAdUrl(encodeAdData(ad));
}

/**
 * URL compacta para QR Code — omite imagem e reduz campos se necessário.
 * A página completa do anúncio continua na URL atual; o QR abre versão leve.
 */
export function buildQrShareUrl(ad: AdData): string {
  let candidate = buildAdHashPayload(ad, false);
  let url = urlForAd(candidate);
  if (url.length <= QR_MAX_URL_CHARS) return url;

  candidate = { ...candidate, pix: undefined };
  url = urlForAd(candidate);
  if (url.length <= QR_MAX_URL_CHARS) return url;

  if (candidate.desc.length > 400) {
    candidate = { ...candidate, desc: candidate.desc.slice(0, 400) };
    url = urlForAd(candidate);
    if (url.length <= QR_MAX_URL_CHARS) return url;
  }

  candidate = {
    t: candidate.t,
    title: candidate.title.slice(0, 80),
    price: candidate.price,
    desc: candidate.desc.slice(0, 150),
    phone: candidate.phone,
    timestamp: candidate.timestamp,
    billingType: candidate.billingType,
    cardLink: candidate.cardLink,
  };
  return urlForAd(candidate);
}

export function isQrUrlSafe(url: string): boolean {
  return url.length > 0 && url.length <= QR_MAX_URL_CHARS;
}
