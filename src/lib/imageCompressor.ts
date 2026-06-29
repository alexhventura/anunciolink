import { MAX_IMAGE_BYTES } from "./constants";
import type { CropTransform, ImageUploadError } from "../types/ad";
import {
  CROP_VIEWPORT,
  DEFAULT_CROP,
  exportCropToDataUrl,
  loadImageElement,
} from "./imageCrop";

export class ImageCompressorError extends Error {
  code: ImageUploadError["code"];

  constructor(code: ImageUploadError["code"], message: string) {
    super(message);
    this.name = "ImageCompressorError";
    this.code = code;
  }
}

export interface ImageCompressionStep {
  maxEdge: number;
  quality: number;
}

/** Primeira passagem ao selecionar foto — preview rápido no editor */
export const UPLOAD_COMPRESSION_STEPS: ImageCompressionStep[] = [
  { maxEdge: 400, quality: 0.58 },
  { maxEdge: 360, quality: 0.52 },
  { maxEdge: 320, quality: 0.48 },
];

/** Passos progressivos até caber na URL (WhatsApp / mobile) */
export const URL_FIT_COMPRESSION_STEPS: ImageCompressionStep[] = [
  { maxEdge: 400, quality: 0.58 },
  { maxEdge: 360, quality: 0.54 },
  { maxEdge: 320, quality: 0.5 },
  { maxEdge: 280, quality: 0.48 },
  { maxEdge: 240, quality: 0.45 },
  { maxEdge: 200, quality: 0.42 },
  { maxEdge: 168, quality: 0.4 },
  { maxEdge: 140, quality: 0.38 },
  { maxEdge: 120, quality: 0.36 },
];

export function validateImageFile(file: File): ImageUploadError | null {
  if (!file.type.startsWith("image/")) {
    return { code: "INVALID_TYPE", message: "Selecione apenas arquivos de imagem (JPG, PNG, WebP)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { code: "FILE_TOO_LARGE", message: "A imagem deve ter no máximo 5 MB." };
  }
  return null;
}

function drawScaledSource(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement {
  const ratio = maxEdge / Math.max(img.width, img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ImageCompressorError("COMPRESS_FAILED", "Canvas indisponível neste navegador.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/** JPEG para payload na URL — menor e previsível que WebP em base64 */
function encodeCanvasJpeg(canvas: HTMLCanvasElement, quality: number): string {
  const jpeg = canvas.toDataURL("image/jpeg", quality);
  if (!jpeg || !jpeg.startsWith("data:image/jpeg") || jpeg.length < 100) {
    throw new ImageCompressorError("COMPRESS_FAILED", "A imagem compactada ficou inválida.");
  }
  return jpeg;
}

export async function compressImageAtStep(
  imageSrc: string,
  step: ImageCompressionStep
): Promise<string> {
  const img = await loadImageElement(imageSrc);
  const canvas = drawScaledSource(img, step.maxEdge);
  return encodeCanvasJpeg(canvas, step.quality);
}

/**
 * Compacta ao selecionar/tirar foto — Canvas max ~400px, JPEG 0.48–0.58.
 * Roda na memória do aparelho antes de qualquer geração de link.
 */
export async function compressImageOnUpload(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (validation) {
    throw new ImageCompressorError(validation.code, validation.message);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    for (const step of UPLOAD_COMPRESSION_STEPS) {
      try {
        const canvas = drawScaledSource(img, step.maxEdge);
        return encodeCanvasJpeg(canvas, step.quality);
      } catch {
        continue;
      }
    }
    const canvas = drawScaledSource(img, 280);
    return encodeCanvasJpeg(canvas, 0.45);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar a imagem.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** @deprecated Alias — use compressImageOnUpload */
export async function compressSourceImage(imageSrc: string): Promise<string> {
  try {
    const img = await loadImageElement(imageSrc);
    for (const step of UPLOAD_COMPRESSION_STEPS) {
      const canvas = drawScaledSource(img, step.maxEdge);
      return encodeCanvasJpeg(canvas, step.quality);
    }
    const canvas = drawScaledSource(img, 280);
    return encodeCanvasJpeg(canvas, 0.45);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar a imagem.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  }
}

/** Recorte baked — apenas export offline (card/impressão) */
export async function compressCroppedImage(
  imageSrc: string,
  crop: CropTransform = DEFAULT_CROP,
  isPrintMode = false
): Promise<string> {
  try {
    return await exportCropToDataUrl(imageSrc, crop, {
      viewportSize: CROP_VIEWPORT,
      outputSize: isPrintMode ? 520 : 480,
      quality: isPrintMode ? 0.72 : 0.68,
      fillWhite: isPrintMode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar o recorte.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  }
}

export function compressImage(file: File): Promise<string> {
  return compressImageOnUpload(file);
}
