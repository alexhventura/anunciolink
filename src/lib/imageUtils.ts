import {
  decodeExternalImageUrl,
  encodeExternalImageUrl,
  isEmbeddedImageData,
  isExternalImageUrl,
  normalizeExternalImageUrl,
} from "./externalImageUrl";

const DATA_URL_IMAGE = /^data:image\/(jpeg|jpg|png|webp|gif|bmp|heic|heif|x-ms-bmp|avif);/i;

/** Verifica se a string é uma URL de imagem suportada para renderização */
export function isRenderableImageSrc(src: string): boolean {
  if (!src?.trim()) return false;
  const trimmed = src.trim();
  if (DATA_URL_IMAGE.test(trimmed)) return true;
  if (trimmed.startsWith("blob:")) return true;
  if (trimmed.startsWith("w:") || trimmed.startsWith("j:") || trimmed.startsWith("u:")) return true;
  if (isExternalImageUrl(trimmed)) return Boolean(normalizeExternalImageUrl(trimmed));
  return false;
}

export function resolveRenderableImageSrc(src: string | undefined): string | undefined {
  if (!src?.trim()) return undefined;
  const trimmed = src.trim();
  if (trimmed.startsWith("u:")) {
    return decodeExternalImageUrl(trimmed) ?? undefined;
  }
  if (isExternalImageUrl(trimmed)) {
    return normalizeExternalImageUrl(trimmed);
  }
  if (DATA_URL_IMAGE.test(trimmed) || trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("w:") || trimmed.startsWith("j:")) return trimmed;
  if (trimmed.startsWith("data:image/")) return trimmed;
  return undefined;
}

export { isEmbeddedImageData, isExternalImageUrl };

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/heic",
  "image/heif",
]);

export function isAllowedImageFile(file: File): boolean {
  if (file.type && ALLOWED_IMAGE_MIME.has(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);
}

export function stripImageForWire(value: string): string {
  if (value.startsWith("u:") || value.startsWith("w:") || value.startsWith("j:")) return value;
  if (isExternalImageUrl(value)) return encodeExternalImageUrl(value);
  const webpMatch = value.match(/^data:image\/webp;base64,(.+)$/);
  if (webpMatch) return `w:${webpMatch[1]}`;
  const jpegMatch = value.match(/^data:image\/(?:jpeg|jpg);base64,(.+)$/);
  if (jpegMatch) return `j:${jpegMatch[1]}`;
  if (value.startsWith("data:image/")) return value;
  return `j:${value}`;
}

export function expandImageFromWire(compact: string): string {
  if (compact.startsWith("u:")) {
    const decoded = decodeExternalImageUrl(compact);
    if (decoded) return decoded;
    return compact;
  }
  if (compact.startsWith("w:")) return `data:image/webp;base64,${compact.slice(2)}`;
  if (compact.startsWith("j:")) return `data:image/jpeg;base64,${compact.slice(2)}`;
  if (compact.startsWith("data:image/")) return compact;
  if (isExternalImageUrl(compact)) return compact;
  return `data:image/jpeg;base64,${compact}`;
}
