import { MAX_IMAGE_BYTES } from "./constants";
import type { ImageUploadError } from "../types/ad";
import {
  CROP_VIEWPORT,
  DEFAULT_CROP,
  exportCropToDataUrl,
  type CropTransform,
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

const OUTPUT_COVER = 240;
const OUTPUT_PRINT = 280;

/** Compacta imagem já recortada pelo editor (Canvas → WebP) */
export async function compressCroppedImage(
  imageSrc: string,
  crop: CropTransform = DEFAULT_CROP,
  isPrintMode = false
): Promise<string> {
  try {
    const outputSize = isPrintMode ? OUTPUT_PRINT : OUTPUT_COVER;
    let quality = isPrintMode ? 0.62 : 0.58;

    let result = await exportCropToDataUrl(imageSrc, crop, {
      viewportSize: CROP_VIEWPORT,
      outputSize,
      quality,
      fillWhite: isPrintMode,
    });

    if (result.length > 120_000 && quality > 0.42) {
      result = await exportCropToDataUrl(imageSrc, crop, {
        viewportSize: CROP_VIEWPORT,
        outputSize: OUTPUT_COVER,
        quality: 0.48,
        fillWhite: isPrintMode,
      });
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao processar o recorte.";
    throw new ImageCompressorError("COMPRESS_FAILED", message);
  }
}

/** @deprecated Use compressCroppedImage após o editor de recorte */
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
      compressCroppedImage(result, DEFAULT_CROP, isPrintMode).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new ImageCompressorError("READ_FAILED", "Erro ao abrir o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}
