import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import type { AdData } from "../types/ad";
import { MAX_SHARE_URL_LENGTH, MAX_SHARE_URL_SAFE } from "./constants";
import { fromCompactWire, normalizeLegacyAd, toCompactWire } from "./adWire";
import { URL_FIT_COMPRESSION_STEPS, compressImageAtStep } from "./imageCompressor";
import { isEmbeddedImageData } from "./imageUtils";
import { estimateAdUrlLength } from "./adRoutes";
import { sanitizeAdData } from "./sanitizeAd";

export { buildAdUrl, buildAdPath, extractPayloadFromLocation } from "./adRoutes";
export { MAX_SHARE_URL_LENGTH, MAX_SHARE_URL_SAFE } from "./constants";

export class AdCodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdCodecError";
  }
}

const V2_PREFIX = "v2.";

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let normalized = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  const bin = atob(normalized);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function legacyBase64Decode(base64: string): AdData | null {
  try {
    let normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    const binString = atob(normalized);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) bytes[i] = binString.charCodeAt(i);
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    return normalizeLegacyAd(parsed);
  } catch {
    return null;
  }
}

function decompressV2Payload(encoded: string): AdData | null {
  try {
    const bytes = base64UrlToBytes(encoded);
    const jsonStr = strFromU8(decompressSync(bytes));
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    return normalizeLegacyAd(parsed);
  } catch {
    return null;
  }
}

/** Codifica anúncio: JSON compacto → Deflate (fflate) → Base64 URL-safe */
export function encodeAdData(data: AdData): string {
  try {
    const wire = toCompactWire(data);
    const jsonStr = JSON.stringify(wire);
    const compressed = compressSync(strToU8(jsonStr), { level: 9 });
    const encoded = bytesToBase64Url(compressed);

    if (!encoded) {
      throw new AdCodecError("Codificação resultou em string vazia.");
    }
    return `${V2_PREFIX}${encoded}`;
  } catch (error) {
    if (error instanceof AdCodecError) throw error;
    throw new AdCodecError("Não foi possível codificar os dados do anúncio.");
  }
}

/** Decodifica v2 (deflate) ou legado (base64 JSON) — síncrono para SEO/bootstrap */
export function decodeAdData(payload: string): AdData | null {
  if (!payload?.trim()) return null;

  const trimmed = payload.trim();

  if (trimmed.startsWith(V2_PREFIX)) {
    const ad = decompressV2Payload(trimmed.slice(V2_PREFIX.length));
    if (ad && isValidAd(ad)) return sanitizeAdData(ad);
  }

  const legacy = legacyBase64Decode(trimmed);
  if (legacy && isValidAd(legacy)) return sanitizeAdData(legacy);

  return null;
}

function isValidAd(ad: AdData): boolean {
  return Boolean(ad.t && ad.title?.trim() && ad.price?.trim() && ad.desc?.trim());
}

export function buildAdHashPayload(ad: AdData, includeImage = true): AdData {
  if (includeImage) return ad;
  return { ...ad, img: undefined, crop: undefined };
}

export function estimateUrlLength(payload: string): number {
  return estimateAdUrlLength(payload);
}

function urlFits(payload: string): boolean {
  return estimateUrlLength(payload) <= MAX_SHARE_URL_SAFE;
}

function truncateDescription(desc: string, maxLen: number): string {
  if (desc.length <= maxLen) return desc;
  if (maxLen <= 1) return "…";
  return `${desc.slice(0, maxLen - 1).trimEnd()}…`;
}

export interface FitAdResult {
  ad: AdData;
  hash: string;
  imageStripped: boolean;
  textOptimized: boolean;
}

/**
 * Garante URL ≤ 2048 chars (checagem em 2000): re-comprime foto, remove imagem
 * ou trunca descrição até caber no WhatsApp/mobile.
 */
export async function fitAdToUrlLength(
  ad: AdData,
  encodeFn: (ad: AdData) => string
): Promise<FitAdResult> {
  let current: AdData = { ...ad };
  let imageStripped = false;
  let textOptimized = false;
  const originalDesc = current.desc;

  if (current.img && isEmbeddedImageData(current.img)) {
    const source = current.img;
    for (const step of URL_FIT_COMPRESSION_STEPS) {
      const compressed = await compressImageAtStep(source, step);
      current = { ...current, img: compressed };
      const hash = encodeFn(current);
      if (urlFits(hash)) {
        return { ad: current, hash, imageStripped, textOptimized };
      }
    }
  }

  let hash = encodeFn(current);
  if (urlFits(hash)) {
    return { ad: current, hash, imageStripped, textOptimized };
  }

  if (current.img) {
    imageStripped = true;
    current = { ...current, img: undefined, crop: undefined };
    hash = encodeFn(current);
    if (urlFits(hash)) {
      return { ad: current, hash, imageStripped, textOptimized };
    }
  }

  let maxDesc = originalDesc.length;
  while (maxDesc > 60) {
    const trialDesc = truncateDescription(originalDesc, maxDesc);
    const trialHash = encodeFn({ ...current, desc: trialDesc });
    if (urlFits(trialHash)) {
      textOptimized = trialDesc.length < originalDesc.length;
      current = { ...current, desc: trialDesc };
      hash = trialHash;
      break;
    }
    maxDesc -= 40;
  }

  if (!urlFits(hash)) {
    if (current.pix && current.pix.length > 120) {
      current = { ...current, pix: current.pix.slice(0, 120) };
      hash = encodeFn(current);
    }
  }

  if (!urlFits(hash)) {
    throw new AdCodecError(
      "Anúncio muito grande para o link do WhatsApp. Encurte o título, a descrição ou o Pix."
    );
  }

  if (estimateUrlLength(hash) > MAX_SHARE_URL_LENGTH) {
    throw new AdCodecError(
      "Anúncio muito grande para o link do WhatsApp. Encurte o título, a descrição ou o Pix."
    );
  }

  return { ad: current, hash, imageStripped, textOptimized };
}
