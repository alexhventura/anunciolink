import { useEffect } from "react";
import type { AdData, AppView } from "../types/ad";
import { applyDocumentMetaForView } from "../lib/documentMeta";

/** Mantém <head> sincronizado quando a view React muda */
export function useDocumentMeta(ad: AdData | null, currentView: AppView) {
  useEffect(() => {
    applyDocumentMetaForView(currentView, ad);
  }, [ad, currentView]);
}
