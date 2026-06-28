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

export function validateImageFile(file: File): ImageUploadError | null {
  if (!file.type.startsWith("image/")) {
    return { code: "INVALID_TYPE", message: "Selecione apenas arquivos de imagem (JPG, PNG, WebP)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { code: "FILE_TOO_LARGE", message: "A imagem deve ter no máximo 5 MB." };
  }
  return null;
}

const QUALITY_STEPS: { maxEdge: number; quality: number }[] = [
  { maxEdge: 480, quality: 0.72 },
  { maxEdge: 420, quality: 0.66 },
  { maxEdge: 360, quality: 0.58 },
  { maxEdge: 320, quality: 0.52 },
];

const MAX_DATA_URL_LENGTH = 95_000;

function drawScaledSource(
  img: HTMLImageElement,
  maxEdge: number
): { canvas: HTMLCanvasElement; quality: number } {
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

  return { canvas, quality: 0.72 };
}

function encodeCanvas(canvas: HTMLCanvasElement, quality: number): string {
  const webp = canvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;

  const jpeg = canvas.toDataURL("image/jpeg", Math.min(quality, 0.55));
  if (!jpeg || jpeg.length < 100) {
    throw new ImageCompressorError("COMPRESS_FAILED", "A imagem compactada ficou inválida.");
  }
  return jpeg;
}

/**
 * Compacta a foto inteira em alta nitidez (sem bake do crop).
 * Vetores de enquadramento vão separados na URL (adWire).
 */
export async function compressSourceImage(imageSrc: string): Promise<string> {
  try {
    const img = await loadImageElement(imageSrc);

    for (const step of QUALITY_STEPS) {
      const { canvas } = drawScaledSource(img, step.maxEdge);
      const encoded = encodeCanvas(canvas, step.quality);
      if (encoded.length <= MAX_DATA_URL_LENGTH) return encoded;
    }

    const { canvas } = drawScaledSource(img, 280);
    return encodeCanvas(canvas, 0.48);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar a imagem.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  }
}

/** Recorte baked — apenas export offline (card PNG legado) */
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

export function compressImage(file: File, isPrintMode = false): Promise<string> {
  const validation = validateImageFile(file);
  if (validation) {
    return Promise.reject(new ImageCompressorError(validation.code, validation.message));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") {
        reject(new ImageCompressorError("READ_FAILED", "Não foi possível ler o arquivo de imagem."));
        return;
      }
      compressSourceImage(result).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new ImageCompressorError("READ_FAILED", "Erro ao abrir o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}
