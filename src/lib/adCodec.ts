import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import type { AdData } from "../types/ad";
import { fromCompactWire, normalizeLegacyAd, toCompactWire } from "./adWire";
import { estimateAdUrlLength } from "./adRoutes";

export { buildAdUrl, buildAdPath, extractPayloadFromLocation } from "./adRoutes";

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
    if (ad && isValidAd(ad)) return ad;
  }

  const legacy = legacyBase64Decode(trimmed);
  if (legacy && isValidAd(legacy)) return legacy;

  return null;
}

function isValidAd(ad: AdData): boolean {
  return Boolean(ad.t && ad.title?.trim() && ad.price?.trim() && ad.desc?.trim());
}

export function buildAdHashPayload(ad: AdData, includeImage = true): AdData {
  if (includeImage) return ad;
  return { ...ad, img: undefined };
}

export function estimateUrlLength(payload: string): number {
  return estimateAdUrlLength(payload);
}

export const MAX_SHARE_URL_LENGTH = 8000;

/** Tenta re-comprimir removendo imagem se a URL exceder o limite prático */
export function fitAdToUrlLength(
  ad: AdData,
  encodeFn: (ad: AdData) => string
): {
  ad: AdData;
  hash: string;
  imageStripped: boolean;
} {
  let current = ad;
  let hash = encodeFn(current);
  if (estimateUrlLength(hash) <= MAX_SHARE_URL_LENGTH) {
    return { ad: current, hash, imageStripped: false };
  }

  if (current.img) {
    current = { ...current, img: undefined };
    hash = encodeFn(current);
    if (estimateUrlLength(hash) <= MAX_SHARE_URL_LENGTH) {
      return { ad: current, hash, imageStripped: true };
    }
  }

  throw new AdCodecError(
    "Anúncio muito grande para a URL. Reduza o texto, o Pix ou a descrição."
  );
}
