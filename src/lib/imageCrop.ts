import type { CropTransform } from "../types/ad";

export type { CropTransform };

export const CROP_VIEWPORT = 280;
export const DEFAULT_CROP: CropTransform = { zoom: 1, panX: 0, panY: 0 };

const WEBP_QUALITY = 0.68;
const JPEG_FALLBACK_QUALITY = 0.55;

export function isDefaultCrop(crop: CropTransform): boolean {
  return crop.zoom === 1 && crop.panX === 0 && crop.panY === 0;
}

/** Escala vetores do editor (280px) para outro tamanho de viewport */
export function scaleCropForViewport(
  crop: CropTransform,
  displayViewport: number,
  editorViewport = CROP_VIEWPORT
): CropTransform {
  if (displayViewport === editorViewport) return crop;
  const ratio = displayViewport / editorViewport;
  return {
    zoom: crop.zoom,
    panX: crop.panX * ratio,
    panY: crop.panY * ratio,
  };
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = src;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  const webp = canvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;

  const jpeg = canvas.toDataURL("image/jpeg", JPEG_FALLBACK_QUALITY);
  if (!jpeg || jpeg.length < 100) {
    throw new Error("A imagem compactada ficou inválida.");
  }
  return jpeg;
}

/** Calcula retângulo de origem (quadrado) — usado em canvas (card social) */
export function getCropSourceRect(
  img: HTMLImageElement,
  crop: CropTransform,
  viewportSize = CROP_VIEWPORT
) {
  const cover = Math.max(viewportSize / img.width, viewportSize / img.height);
  const scale = cover * crop.zoom;
  const srcSize = viewportSize / scale;
  const srcCenterX = img.width / 2 - crop.panX / scale;
  const srcCenterY = img.height / 2 - crop.panY / scale;

  let srcX = srcCenterX - srcSize / 2;
  let srcY = srcCenterY - srcSize / 2;
  srcX = Math.max(0, Math.min(img.width - srcSize, srcX));
  srcY = Math.max(0, Math.min(img.height - srcSize, srcY));

  const clampedSize = Math.min(srcSize, img.width - srcX, img.height - srcY);
  return { srcX, srcY, srcSize: clampedSize, scale };
}

/** Posicionamento CSS idêntico ao mini-editor */
export function getCropPreviewStyle(
  img: HTMLImageElement,
  crop: CropTransform,
  viewportSize = CROP_VIEWPORT
): { width: number; height: number; transform: string } {
  const cover = Math.max(viewportSize / img.width, viewportSize / img.height);
  const scale = cover * crop.zoom;
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const drawX = viewportSize / 2 + crop.panX - drawW / 2;
  const drawY = viewportSize / 2 + crop.panY - drawH / 2;

  return {
    width: drawW,
    height: drawH,
    transform: `translate3d(${drawX}px, ${drawY}px, 0)`,
  };
}

export function getCropPreviewStyleForContainer(
  img: HTMLImageElement,
  crop: CropTransform,
  containerSize: number
) {
  const scaled = scaleCropForViewport(crop, containerSize);
  return getCropPreviewStyle(img, scaled, containerSize);
}

/** Export legado — recorte baked (card/impressão offline) */
export async function exportCropToDataUrl(
  imageSrc: string,
  crop: CropTransform,
  options: {
    viewportSize?: number;
    outputSize?: number;
    quality?: number;
    fillWhite?: boolean;
  } = {}
): Promise<string> {
  const viewportSize = options.viewportSize ?? CROP_VIEWPORT;
  const outputSize = options.outputSize ?? 480;
  const img = await loadImageElement(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível neste navegador.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (options.fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);
  }

  const { srcX, srcY, srcSize } = getCropSourceRect(img, crop, viewportSize);
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);

  return canvasToDataUrl(canvas, options.quality ?? WEBP_QUALITY);
}
