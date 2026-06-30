import { useEffect } from "react";
import type { AdData, AppView } from "../types/ad";
import { DocumentHeadService } from "../lib/documentHeadService";

/** Mantém <head> sincronizado quando a view React muda */
export function useDocumentMeta(ad: AdData | null, currentView: AppView) {
  useEffect(() => {
    DocumentHeadService.apply(currentView, ad);
  }, [ad, currentView]);
}
