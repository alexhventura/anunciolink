import type { AdData } from "../types/ad";
import { MAX_SHARE_URL_LENGTH, MAX_SHARE_URL_SAFE } from "./constants";
import { buildAdUrl, estimateAdUrlLength } from "./adRoutes";
import { decodeAdData, encodeAdData, AdCodecError } from "./adCodec";
import { fromCompactWire, toCompactWire, type CompactAdWire } from "./adWire";
import { encryptAdPayload, isValidAdPassword, sanitizeAdPassword } from "./adLock";
import { sanitizeAdData } from "./sanitizeAd";

/** Limite seguro para QR Code nível M */
export const QR_MAX_URL_CHARS = 900;

export interface FitAdResult {
  ad: AdData;
  hash: string;
  imageStripped: boolean;
  textOptimized: boolean;
}

export type PayloadScoreLevel = "excellent" | "good" | "fair" | "heavy";

export interface PayloadScore {
  level: PayloadScoreLevel;
  percent: number;
  bytes: number;
  urlLength: number;
  tip: string;
}

function isValidAd(ad: AdData): boolean {
  return Boolean(ad.t && ad.title?.trim() && ad.price?.trim() && ad.desc?.trim());
}

function urlFitsShare(payload: string): boolean {
  return estimateAdUrlLength(payload) <= MAX_SHARE_URL_SAFE;
}

function truncateDescription(desc: string, maxLen: number): string {
  if (desc.length <= maxLen) return desc;
  if (maxLen <= 1) return "…";
  return `${desc.slice(0, maxLen - 1).trimEnd()}…`;
}

function stripLegacyImageFields(ad: AdData): AdData {
  return { ...ad, img: undefined, crop: undefined };
}

function encodeNormalized(ad: AdData): string {
  return encodeAdData(sanitizeAdData(ad));
}

function urlForAd(ad: AdData): string {
  return buildAdUrl(encodeNormalized(ad));
}

/**
 * Camada única de serialização — normalize, validate, encode, decode,
 * fit para share URL e QR URL.
 */
export const AdSerializer = {
  normalize(ad: AdData): AdData {
    return sanitizeAdData(ad);
  },

  validate(ad: AdData): boolean {
    return isValidAd(this.normalize(ad));
  },

  toWire(ad: AdData): CompactAdWire {
    return toCompactWire(this.normalize(ad));
  },

  fromWire(wire: CompactAdWire): AdData {
    return fromCompactWire(wire);
  },

  encode(ad: AdData): string {
    return encodeNormalized(ad);
  },

  decode(payload: string): AdData | null {
    return decodeAdData(payload);
  },

  estimatePayloadBytes(ad: AdData): number {
    return new TextEncoder().encode(this.encode(ad)).length;
  },

  estimateShareUrlLength(payload: string): number {
    return estimateAdUrlLength(payload);
  },

  /** Garante URL de compartilhamento ≤ limites WhatsApp/mobile */
  async fitForShareUrl(ad: AdData, password?: string): Promise<FitAdResult> {
    const lockKey = password?.trim() ? sanitizeAdPassword(password) : "";
    const mustLock = Boolean(lockKey);

    let current = this.normalize(ad);
    let imageStripped = false;
    let textOptimized = false;
    const originalDesc = current.desc;

    let hash = encodeNormalized(current);
    if (urlFitsShare(hash) && !mustLock) {
      return { ad: current, hash, imageStripped, textOptimized };
    }

    if (current.img) {
      imageStripped = true;
      current = stripLegacyImageFields(current);
      hash = encodeNormalized(current);
      if (urlFitsShare(hash) && !mustLock) {
        return { ad: current, hash, imageStripped, textOptimized };
      }
    }

    let maxDesc = originalDesc.length;
    while (maxDesc > 60) {
      const trialDesc = truncateDescription(originalDesc, maxDesc);
      const trialHash = encodeNormalized({ ...current, desc: trialDesc });
      if (urlFitsShare(trialHash)) {
        textOptimized = trialDesc.length < originalDesc.length;
        current = { ...current, desc: trialDesc };
        hash = trialHash;
        break;
      }
      maxDesc -= 40;
    }

    if (!urlFitsShare(hash)) {
      if (current.pix && current.pix.length > 120) {
        current = { ...current, pix: current.pix.slice(0, 120) };
        hash = encodeNormalized(current);
      }
    }

    if (!urlFitsShare(hash)) {
      throw new AdCodecError(
        "Anúncio muito grande para o link do WhatsApp. Encurte o título, a descrição ou o Pix."
      );
    }

    if (estimateAdUrlLength(hash) > MAX_SHARE_URL_LENGTH) {
      throw new AdCodecError(
        "Anúncio muito grande para o link do WhatsApp. Encurte o título, a descrição ou o Pix."
      );
    }

    const lockKeyFinal = lockKey;
    if (lockKeyFinal) {
      if (!isValidAdPassword(lockKeyFinal)) {
        throw new AdCodecError(
          "Use uma senha de 1 a 4 caracteres — apenas letras e números."
        );
      }
      hash = encryptAdPayload(hash, lockKeyFinal);
      if (!urlFitsShare(hash) || estimateAdUrlLength(hash) > MAX_SHARE_URL_LENGTH) {
        throw new AdCodecError(
          "Com a senha, o link ficou grande demais. Encurte título, descrição ou Pix."
        );
      }
    }

    return { ad: current, hash, imageStripped, textOptimized };
  },

  /** URL compacta para QR Code — omite legado e reduz campos se necessário */
  buildQrUrl(ad: AdData): string {
    let candidate = stripLegacyImageFields(this.normalize(ad));
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
      icon: candidate.icon,
    };
    return urlForAd(candidate);
  },

  isQrUrlSafe(url: string): boolean {
    return url.length > 0 && url.length <= QR_MAX_URL_CHARS;
  },

  /** Score local do payload — sem analytics, só estimativa de peso da URL */
  getPayloadScore(ad: AdData): PayloadScore {
    const normalized = this.normalize(ad);
    let hash: string;
    try {
      hash = this.encode(normalized);
    } catch {
      return {
        level: "heavy",
        percent: 100,
        bytes: 0,
        urlLength: MAX_SHARE_URL_LENGTH + 1,
        tip: "Reduza título, descrição ou Pix para gerar o link.",
      };
    }

    const bytes = new TextEncoder().encode(hash).length;
    const urlLength = estimateAdUrlLength(hash);
    const ratio = urlLength / MAX_SHARE_URL_SAFE;
    const percent = Math.min(100, Math.round(ratio * 100));

    let level: PayloadScoreLevel;
    let tip: string;

    if (percent <= 45) {
      level = "excellent";
      tip = "Seu anúncio está extremamente leve — ideal para WhatsApp e QR Code.";
    } else if (percent <= 70) {
      level = "good";
      tip = "Link em bom tamanho. Compartilhe sem preocupação.";
    } else if (percent <= 90) {
      level = "fair";
      tip = "A descrição pode ser reduzida para deixar o link mais curto.";
    } else {
      level = "heavy";
      tip = "Link pesado — encurte título, descrição ou Pix antes de publicar.";
    }

    return { level, percent, bytes, urlLength, tip };
  },
};

export { AdCodecError } from "./adCodec";