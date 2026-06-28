import { MAX_IMAGE_BYTES } from "./constants";
import type { ImageUploadError } from "../types/ad";

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

const IMAGE_MAX_DIM = 160;
const WEBP_QUALITY = 0.52;
const JPEG_FALLBACK_QUALITY = 0.5;

function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  const webp = canvas.toDataURL("image/webp", WEBP_QUALITY);
  if (webp.startsWith("data:image/webp")) return webp;

  const jpeg = canvas.toDataURL("image/jpeg", JPEG_FALLBACK_QUALITY);
  if (!jpeg || jpeg.length < 100) {
    throw new ImageCompressorError("COMPRESS_FAILED", "A imagem compactada ficou inválida.");
  }
  return jpeg;
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

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = IMAGE_MAX_DIM;
        canvas.width = maxDim;
        canvas.height = maxDim;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new ImageCompressorError("COMPRESS_FAILED", "Seu navegador não suportou a compactação da imagem."));
          return;
        }

        const { width, height } = img;

        if (isPrintMode) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, maxDim, maxDim);
          const ratio = Math.min(maxDim / width, maxDim / height);
          const newWidth = width * ratio;
          const newHeight = height * ratio;
          const x = (maxDim - newWidth) / 2;
          const y = (maxDim - newHeight) / 2;
          ctx.drawImage(img, 0, 0, width, height, x, y, newWidth, newHeight);
        } else {
          const size = Math.min(width, height);
          const sx = (width - size) / 2;
          const sy = (height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, maxDim, maxDim);
        }

        try {
          resolve(canvasToDataUrl(canvas));
        } catch (err) {
          if (err instanceof ImageCompressorError) reject(err);
          else reject(new ImageCompressorError("COMPRESS_FAILED", "Falha ao gerar WebP compactado."));
        }
      };
      img.onerror = () => reject(new ImageCompressorError("READ_FAILED", "Não foi possível processar esta imagem."));
      img.src = result;
    };
    reader.onerror = () => reject(new ImageCompressorError("READ_FAILED", "Erro ao abrir o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}
