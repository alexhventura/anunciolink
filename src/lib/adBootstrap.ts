import { decodeAdData } from "./adCodec";
import { DocumentHeadService } from "./documentHeadService";
import { setBootstrapAdResult } from "./bootstrappedAd";
import { extractPayloadFromLocation, upgradeHashRouteToPath } from "./adRoutes";
import type { AdData } from "../types/ad";

/** Bootstrap síncrono: decodifica URL e injeta SEO antes do React montar */
export function bootstrapAdFromUrl(): AdData | null {
  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();
  if (!payload) {
    setBootstrapAdResult(null, "");
    return null;
  }

  const ad = decodeAdData(payload);
  if (ad) DocumentHeadService.applyAd(ad);
  setBootstrapAdResult(ad, payload);
  return ad;
}
