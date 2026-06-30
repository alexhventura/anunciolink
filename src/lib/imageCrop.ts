import type { CropTransform } from "../types/ad";

export type { CropTransform };

export const DEFAULT_CROP: CropTransform = { zoom: 1, panX: 0, panY: 0 };

export function isDefaultCrop(crop: CropTransform): boolean {
  return crop.zoom === 1 && crop.panX === 0 && crop.panY === 0;
}

/** Carrega imagem embutida em anúncios legados (compactação de URL) */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = src;
  });
}
