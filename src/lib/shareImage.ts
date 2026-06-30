import type { AdData } from "../types/ad";
import { AD_QR_FOREGROUND } from "./adThemes";
import { renderPreviewCardBlob } from "./adPreviewCardCanvas";
import { renderQrToCanvas } from "./qrCanvas";
import { slugifyFilename } from "./socialCardRenderer";

/** Gera JPG 1080px do card quadrado para postagem manual ou Web Share API */
export async function generateShareCardBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const qrCanvas = await renderQrToCanvas(qrUrl, 256, AD_QR_FOREGROUND);
  return renderPreviewCardBlob(
    {
      adType: ad.t,
      title: ad.title,
      price: ad.price,
      description: ad.desc,
      icon: ad.icon,
      billingRecorrente: ad.billingType === "recorrente",
      phone: ad.phone,
      qrCanvas,
      width: 1080,
    },
    "image/jpeg",
    0.92
  );
}

export function shareCardFilename(ad: AdData): string {
  return `anunciolink-${slugifyFilename(ad.title)}.jpg`;
}
