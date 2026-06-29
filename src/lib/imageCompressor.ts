import { MAX_IMAGE_BYTES } from "./constants";
import type { ImageUploadError } from "../types/ad";
import { loadImageElement } from "./imageCrop";

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

/** Upload automático — 300px max, JPEG agressivo */
export const UPLOAD_COMPRESSION: ImageCompressionStep = { maxEdge: 300, quality: 0.4 };

/** Passos progressivos até caber na URL (WhatsApp ≤ 2048) */
export const URL_FIT_COMPRESSION_STEPS: ImageCompressionStep[] = [
  { maxEdge: 300, quality: 0.4 },
  { maxEdge: 280, quality: 0.43 },
  { maxEdge: 260, quality: 0.42 },
  { maxEdge: 240, quality: 0.4 },
  { maxEdge: 200, quality: 0.38 },
  { maxEdge: 168, quality: 0.36 },
  { maxEdge: 140, quality: 0.35 },
  { maxEdge: 120, quality: 0.34 },
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
 * Compacta ao selecionar da galeria — 300px, JPEG ~0.45.
 * Processo 100% automático, invisível ao usuário.
 */
export async function compressImageOnUpload(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (validation) {
    throw new ImageCompressorError(validation.code, validation.message);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const canvas = drawScaledSource(img, UPLOAD_COMPRESSION.maxEdge);
    return encodeCanvasJpeg(canvas, UPLOAD_COMPRESSION.quality);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar a imagem.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressSourceImage(imageSrc: string): Promise<string> {
  return compressImageAtStep(imageSrc, UPLOAD_COMPRESSION);
}

export function compressImage(file: File): Promise<string> {
  return compressImageOnUpload(file);
}
