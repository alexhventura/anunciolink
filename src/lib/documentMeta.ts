import type { AdData, AppView } from "../types/ad";
import { DocumentHeadService } from "./documentHeadService";

/** Re-exports finos — implementação em DocumentHeadService */
export function applyAdDocumentMeta(ad: AdData) {
  DocumentHeadService.applyAd(ad);
}

export function applyHomeDocumentMeta() {
  DocumentHeadService.applyHome();
}

export function applyInstitutionalDocumentMeta(
  view: Extract<
    AppView,
    "meus-anuncios" | "como-funciona" | "sobre" | "privacidade" | "termos"
  >
) {
  DocumentHeadService.applyInstitutional(view);
}

export function applyDocumentMetaForView(view: AppView, ad: AdData | null) {
  DocumentHeadService.apply(view, ad);
}
