import { useEffect } from "react";
import type { AdData } from "../types/ad";
import { applyAdDocumentMeta, applyHomeDocumentMeta } from "../lib/documentMeta";

/** Mantém <head> sincronizado quando a view React muda */
export function useDocumentMeta(ad: AdData | null, isAdView: boolean) {
  useEffect(() => {
    if (isAdView && ad) {
      applyAdDocumentMeta(ad);
    } else {
      applyHomeDocumentMeta();
    }
  }, [ad, isAdView]);
}
