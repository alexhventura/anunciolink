import { loadImageElement } from "./imageCrop";

export interface ImageCompressionStep {
  maxEdge: number;
  quality: number;
}

/** Passos progressivos até caber na URL (WhatsApp ≤ 2048) — anúncios legados com foto embutida */
export const URL_FIT_COMPRESSION_STEPS: ImageCompressionStep[] = [
  { maxEdge: 150, quality: 0.4 },
  { maxEdge: 140, quality: 0.38 },
  { maxEdge: 120, quality: 0.36 },
  { maxEdge: 100, quality: 0.35 },
  { maxEdge: 80, quality: 0.34 },
];

function drawScaledSource(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement {
  const ratio = maxEdge / Math.max(img.width, img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponível neste navegador.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function encodeCanvasJpeg(canvas: HTMLCanvasElement, quality: number): string {
  const jpeg = canvas.toDataURL("image/jpeg", quality);
  if (!jpeg || !jpeg.startsWith("data:image/jpeg") || jpeg.length < 100) {
    throw new Error("A imagem compactada ficou inválida.");
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
