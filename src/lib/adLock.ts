import CryptoJS from "crypto-js";
import type { AdData } from "../types/ad";
import { decodeAdData } from "./adCodec";

/** Prefixo no path /a/locked.xxx — análogo ao v2. */
export const LOCKED_PAYLOAD_PREFIX = "locked.";

/** Legado: #locked_xxx no hash (convertido para locked.xxx no path) */
export const LEGACY_LOCKED_HASH_PREFIX = "#locked_";

export const AD_PASSWORD_MAX_LENGTH = 4;
const AD_PASSWORD_PATTERN = /^[A-Za-z0-9]{1,4}$/;

export function sanitizeAdPassword(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").slice(0, AD_PASSWORD_MAX_LENGTH);
}

export function isValidAdPassword(password: string): boolean {
  return AD_PASSWORD_PATTERN.test(password);
}

export function isLockedPayload(payload: string): boolean {
  return payload.trim().startsWith(LOCKED_PAYLOAD_PREFIX);
}

function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromUrlSafeBase64(urlSafe: string): string {
  let normalized = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return normalized;
}

/** Criptografa o payload v2. com AES (chave = senha do editor). */
export function encryptAdPayload(plainPayload: string, password: string): string {
  const key = sanitizeAdPassword(password);
  if (!isValidAdPassword(key)) {
    throw new Error("Senha inválida para proteger o anúncio.");
  }

  const cipherBase64 = CryptoJS.AES.encrypt(plainPayload, key).toString();
  return `${LOCKED_PAYLOAD_PREFIX}${toUrlSafeBase64(cipherBase64)}`;
}

/** Descriptografa locked.xxx — retorna null se a senha estiver errada. */
export function decryptAdPayload(lockedPayload: string, password: string): string | null {
  if (!isLockedPayload(lockedPayload)) return null;

  const key = sanitizeAdPassword(password);
  if (!isValidAdPassword(key)) return null;

  const cipherUrlSafe = lockedPayload.trim().slice(LOCKED_PAYLOAD_PREFIX.length);
  if (!cipherUrlSafe) return null;

  try {
    const decrypted = CryptoJS.AES.decrypt(fromUrlSafeBase64(cipherUrlSafe), key);
    const plain = decrypted.toString(CryptoJS.enc.Utf8);
    return plain || null;
  } catch {
    return null;
  }
}

/** Tenta desbloquear e decodificar o anúncio protegido. */
export function tryUnlockAdData(lockedPayload: string, password: string): AdData | null {
  const plain = decryptAdPayload(lockedPayload, password);
  if (!plain) return null;
  return decodeAdData(plain);
}
