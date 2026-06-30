import {
  isLockedPayload,
  LEGACY_LOCKED_HASH_PREFIX,
  LOCKED_PAYLOAD_PREFIX,
} from "./adLock";
import { SITE_URL } from "./constants";

function payloadFromLockedHash(hash: string): string | null {
  if (!hash.startsWith(LEGACY_LOCKED_HASH_PREFIX)) return null;
  const cipher = hash.slice(LEGACY_LOCKED_HASH_PREFIX.length);
  return cipher ? `${LOCKED_PAYLOAD_PREFIX}${cipher}` : null;
}

function lockedCipherFromPayload(payload: string): string {
  return payload.startsWith(LOCKED_PAYLOAD_PREFIX)
    ? payload.slice(LOCKED_PAYLOAD_PREFIX.length)
    : payload;
}

/** Prefixo de rota indexável (path) — preferido sobre #hash */
export const AD_PATH_PREFIX = "/a/";

export function isAdPathname(pathname: string): boolean {
  return pathname.startsWith(AD_PATH_PREFIX);
}

export function buildAdPath(payload: string): string {
  return `${AD_PATH_PREFIX}${encodeURIComponent(payload)}`;
}

export function buildAdUrl(payload: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : new URL(SITE_URL).origin;

  if (isLockedPayload(payload)) {
    const cipher = lockedCipherFromPayload(payload);
    return `${origin}/${LEGACY_LOCKED_HASH_PREFIX}${cipher}`;
  }

  return `${origin}${buildAdPath(payload)}`;
}

function readPathPayload(pathname: string): string | null {
  if (!isAdPathname(pathname)) return null;

  const segment = pathname.slice(AD_PATH_PREFIX.length);
  if (!segment) return null;

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Lê payload de URL completa (histórico local, links salvos) */
export function extractPayloadFromAdUrl(url: string): string | null {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : new URL(SITE_URL).origin;
    const parsed = new URL(url, base);

    const lockedFromHash = payloadFromLockedHash(parsed.hash);
    if (lockedFromHash) return lockedFromHash;

    const fromPath = readPathPayload(parsed.pathname);
    if (fromPath) return fromPath;

    if (parsed.hash.startsWith("#dados=")) {
      return parsed.hash.substring(7);
    }
  } catch {
    return null;
  }

  return null;
}

/** Lê payload de #locked_, /a/:payload ou #dados= (legado) */
export function extractPayloadFromLocation(loc: Location = window.location): string | null {
  const lockedFromHash = payloadFromLockedHash(loc.hash);
  if (lockedFromHash) return lockedFromHash;

  const fromPath = readPathPayload(loc.pathname);
  if (fromPath) return fromPath;

  if (loc.hash.startsWith("#dados=")) {
    return loc.hash.substring(7);
  }

  return null;
}

/** Converte link legado #dados= → /a/:payload (replaceState). #locked_ permanece no hash. */
export function upgradeHashRouteToPath(): string | null {
  if (typeof window === "undefined") return null;
  if (isAdPathname(window.location.pathname)) return null;

  const hash = window.location.hash;
  if (hash.startsWith(LEGACY_LOCKED_HASH_PREFIX)) return null;

  if (!hash.startsWith("#dados=")) return null;

  const payload = hash.substring(7);
  if (!payload) return null;

  history.replaceState({ adPayload: payload }, "", buildAdPath(payload));
  return payload;
}

export function navigateToAdPath(payload: string, replace = false): void {
  if (isLockedPayload(payload)) {
    const cipher = lockedCipherFromPayload(payload);
    const href = `/${LEGACY_LOCKED_HASH_PREFIX}${cipher}`;
    if (replace) {
      history.replaceState({ adPayload: payload }, "", href);
    } else {
      history.pushState({ adPayload: payload }, "", href);
    }
    return;
  }

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
  if (typeof window === "undefined") return SITE_URL;
  return `${window.location.origin}${window.location.pathname}${window.location.hash}`;
}

export function estimateAdUrlLength(payload: string): number {
  const origin = new URL(SITE_URL).origin;
  if (isLockedPayload(payload)) {
    const cipher = lockedCipherFromPayload(payload);
    return `${origin}/${LEGACY_LOCKED_HASH_PREFIX}${cipher}`.length;
  }
  return `${origin}${buildAdPath(payload)}`.length;
}
