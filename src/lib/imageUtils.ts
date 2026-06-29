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

const DATA_URL_IMAGE = /^data:image\/(jpeg|jpg|png|webp|gif|bmp|heic|heif|x-ms-bmp);/i;

/** Verifica se a string é uma URL de imagem suportada para renderização */
export function isRenderableImageSrc(src: string): boolean {
  if (!src?.trim()) return false;
  if (DATA_URL_IMAGE.test(src.trim())) return true;
  if (src.startsWith("blob:")) return true;
  if (src.startsWith("w:") || src.startsWith("j:")) return true;
  return false;
}

export function isAllowedImageFile(file: File): boolean {
  if (file.type && ALLOWED_IMAGE_MIME.has(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);
}
