import { sanitizeHttpUrl } from "./sanitize";

/** Hospedagem gratuita sugerida ao criador */
export const POSTIMAGES_UPLOAD_URL = "https://postimages.org/";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)(\?|$)/i;
const KNOWN_IMAGE_HOSTS =
  /(postimg|postimages|imgur|i\.ibb|cloudinary|unsplash|images\.|cdn\.|static\.|media\.|upload)/i;

/** Codifica URL externa para wire compacto (prefixo u: + base64url) */
export function encodeExternalImageUrl(url: string): string {
  const bytes = new TextEncoder().encode(url);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `u:${b64}`;
}

/** Decodifica wire u: → URL https original */
export function decodeExternalImageUrl(compact: string): string | null {
  if (!compact.startsWith("u:")) return null;
  try {
    let normalized = compact.slice(2).replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    const bin = atob(normalized);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = new TextDecoder().decode(bytes);
    return sanitizeHttpUrl(url) ?? null;
  } catch {
    return null;
  }
}

export function isExternalImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function isEmbeddedImageData(value: string): boolean {
  if (!value?.trim()) return false;
  if (isExternalImageUrl(value)) return false;
  return (
    value.startsWith("data:image/") ||
    value.startsWith("w:") ||
    value.startsWith("j:") ||
    value.startsWith("blob:")
  );
}

/** Valida URL colada no formulário */
export function isValidExternalImageUrl(input: string): boolean {
  const normalized = normalizeExternalImageUrl(input);
  return Boolean(normalized);
}

/** Normaliza e sanitiza URL externa para armazenamento */
export function normalizeExternalImageUrl(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  const safe = sanitizeHttpUrl(trimmed);
  if (!safe) return undefined;
  if (!looksLikeImageUrl(safe)) return undefined;
  return safe;
}

function looksLikeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const path = `${parsed.pathname}${parsed.search}`;
    if (IMAGE_EXT.test(path)) return true;
    if (KNOWN_IMAGE_HOSTS.test(parsed.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

/** Carrega imagem externa para canvas (best-effort; CORS pode bloquear) */
export function loadExternalImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem externa."));
    img.src = src;
  });
}

export function getExternalImageUrlValidationMessage(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Use um link que comece com http:// ou https://";
    }
  } catch {
    return "Informe um link de imagem válido (ex: https://…/foto.jpg)";
  }
  if (!looksLikeImageUrl(trimmed)) {
    return "O link deve apontar para uma imagem (.jpg, .png, .webp…) ou um host de imagens conhecido.";
  }
  return null;
}
