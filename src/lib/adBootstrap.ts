import { decodeAdData } from "./adCodec";
import { applyAdDocumentMeta } from "./documentMeta";
import { extractPayloadFromLocation, upgradeHashRouteToPath } from "./adRoutes";
import type { AdData } from "../types/ad";

/** Bootstrap síncrono: decodifica URL e injeta SEO antes do React montar */
export function bootstrapAdFromUrl(): AdData | null {
  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();
  if (!payload) return null;

  const ad = decodeAdData(payload);
  if (ad) applyAdDocumentMeta(ad);
  return ad;
}
