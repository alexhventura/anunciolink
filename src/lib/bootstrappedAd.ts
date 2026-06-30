import type { AdData } from "../types/ad";

let bootstrappedAd: AdData | null = null;
let bootstrappedPayload = "";

export function setBootstrapAdResult(ad: AdData | null, payload = ""): void {
  bootstrappedAd = ad;
  bootstrappedPayload = payload;
}

export function getBootstrapAdResult(): { ad: AdData | null; payload: string } {
  return { ad: bootstrappedAd, payload: bootstrappedPayload };
}
