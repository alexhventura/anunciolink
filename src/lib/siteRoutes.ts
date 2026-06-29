import type { AppView } from "../types/ad";

export const SITE_PAGE_PATHS = {
  comoFunciona: "/como-funciona",
  sobre: "/sobre",
  privacidade: "/privacidade",
  termos: "/termos",
} as const;

export type InstitutionalView = Extract<
  AppView,
  "como-funciona" | "sobre" | "privacidade" | "termos"
>;

const VIEW_TO_PATH: Record<InstitutionalView, string> = {
  "como-funciona": SITE_PAGE_PATHS.comoFunciona,
  sobre: SITE_PAGE_PATHS.sobre,
  privacidade: SITE_PAGE_PATHS.privacidade,
  termos: SITE_PAGE_PATHS.termos,
};

const PATH_TO_VIEW: Record<string, InstitutionalView> = {
  [SITE_PAGE_PATHS.comoFunciona]: "como-funciona",
  [SITE_PAGE_PATHS.sobre]: "sobre",
  [SITE_PAGE_PATHS.privacidade]: "privacidade",
  [SITE_PAGE_PATHS.termos]: "termos",
};

export function isInstitutionalView(view: AppView): view is InstitutionalView {
  return view in VIEW_TO_PATH;
}

export function getInstitutionalViewFromPathname(pathname: string): InstitutionalView | null {
  return PATH_TO_VIEW[pathname] ?? null;
}

export function getPathForInstitutionalView(view: InstitutionalView): string {
  return VIEW_TO_PATH[view];
}

export function navigateToInstitutionalPage(view: InstitutionalView, replace = false): void {
  const path = getPathForInstitutionalView(view);
  if (replace) {
    history.replaceState({ sitePage: view }, "", path);
  } else {
    history.pushState({ sitePage: view }, "", path);
  }
}
