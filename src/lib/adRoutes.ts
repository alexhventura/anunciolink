import { SITE_URL } from "./constants";

/** Prefixo de rota indexável (path) — preferido sobre #hash */
export const AD_PATH_PREFIX = "/a/";

export function isAdPathname(pathname: string): boolean {
  return pathname.startsWith(AD_PATH_PREFIX);
}

export function buildAdPath(payload: string): string {
  return `${AD_PATH_PREFIX}${payload}`;
}

export function buildAdUrl(payload: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : new URL(SITE_URL).origin;
  return `${origin}${buildAdPath(payload)}`;
}

/** Lê payload de /a/:payload (preferido) ou #dados= (legado) */
export function extractPayloadFromLocation(loc: Location = window.location): string | null {
  if (isAdPathname(loc.pathname)) {
    const segment = loc.pathname.slice(AD_PATH_PREFIX.length);
    if (segment) {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    }
  }

  if (loc.hash.startsWith("#dados=")) {
    return loc.hash.substring(7);
  }

  return null;
}

/** Converte link legado #dados= → /a/:payload (replaceState, sem reload) */
export function upgradeHashRouteToPath(): string | null {
  if (typeof window === "undefined") return null;
  if (isAdPathname(window.location.pathname)) return null;

  const hash = window.location.hash;
  if (!hash.startsWith("#dados=")) return null;

  const payload = hash.substring(7);
  if (!payload) return null;

  history.replaceState({ adPayload: payload }, "", buildAdPath(payload));
  return payload;
}

export function navigateToAdPath(payload: string, replace = false): void {
  const path = buildAdPath(payload);
  if (replace) {
    history.replaceState({ adPayload: payload }, "", path);
  } else {
    history.pushState({ adPayload: payload }, "", path);
  }
}

export function navigateToHome(replace = false): void {
  if (replace) {
    history.replaceState(null, "", "/");
  } else {
    history.pushState(null, "", "/");
  }
}

export function getAdCanonicalUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export function estimateAdUrlLength(payload: string): number {
  /** Usa domínio de produção para garantir compatibilidade no WhatsApp mesmo em localhost */
  const origin = new URL(SITE_URL).origin;
  return `${origin}${buildAdPath(payload)}`.length;
}
