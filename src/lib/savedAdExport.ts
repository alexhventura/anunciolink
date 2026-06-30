import type { AdData } from "../types/ad";
import type { SavedAdEntry } from "./adHistory";
import { decodeAdData } from "./adCodec";
import { isLockedPayload } from "./adLock";
import { extractPayloadFromAdUrl } from "./adRoutes";

/** Reconstrói AdData de um anúncio salvo localmente (não funciona com senha). */
export function resolveSavedAdData(entry: SavedAdEntry): AdData | null {
  const payload = entry.payload ?? extractPayloadFromAdUrl(entry.url);
  if (!payload || isLockedPayload(payload)) return null;
  return decodeAdData(payload);
}

export function isSavedAdExportable(entry: SavedAdEntry): boolean {
  return resolveSavedAdData(entry) !== null;
}
