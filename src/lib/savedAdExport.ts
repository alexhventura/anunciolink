import type { AdData } from "../types/ad";
import type { SavedAdEntry } from "./adHistory";
import { decodeAdData } from "./adCodec";
import { isLockedPayload } from "./adLock";
import { extractPayloadFromAdUrl } from "./adRoutes";
import { hasPixQr } from "./exportQr";

/** Reconstrói AdData completo de um anúncio salvo (null se protegido por senha). */
export function resolveSavedAdData(entry: SavedAdEntry): AdData | null {
  const payload = entry.payload ?? extractPayloadFromAdUrl(entry.url);
  if (!payload || isLockedPayload(payload)) return null;
  return decodeAdData(payload);
}

/** Dados mínimos para exportação — funciona mesmo com anúncio bloqueado por senha */
export function resolveSavedAdForExport(entry: SavedAdEntry): AdData {
  const full = resolveSavedAdData(entry);
  if (full) return full;

  return {
    t: entry.type,
    title: entry.title.trim() || "Anúncio",
    price: entry.price.trim() || "—",
    desc: "Abra o link para ver a descrição completa do anúncio.",
    phone: "",
    timestamp: entry.createdAt,
  };
}

export function savedAdHasPix(entry: SavedAdEntry): boolean {
  const full = resolveSavedAdData(entry);
  return full ? hasPixQr(full) : false;
}

/** @deprecated Use resolveSavedAdForExport */
export function isSavedAdExportable(_entry: SavedAdEntry): boolean {
  return true;
}
