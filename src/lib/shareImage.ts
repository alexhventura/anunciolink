import type { AdData } from "../types/ad";
import { AD_QR_FOREGROUND } from "./adThemes";
import { renderPreviewCardBlob } from "./adPreviewCardCanvas";
import { renderQrToCanvas } from "./qrCanvas";
import { slugifyFilename } from "./socialCardRenderer";

/** Gera PNG 1080px do card para postagem manual ou Web Share API */
export async function generateShareCardBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const qrCanvas = await renderQrToCanvas(qrUrl, 280, AD_QR_FOREGROUND);
  return renderPreviewCardBlob({
    adType: ad.t,
    title: ad.title,
    price: ad.price,
    description: ad.desc,
    icon: ad.icon,
    billingRecorrente: ad.billingType === "recorrente",
    phone: ad.phone,
    qrCanvas,
    width: 1080,
  });
}

export function shareCardFilename(ad: AdData): string {
  return `anunciolink-${slugifyFilename(ad.title)}.png`;
}
