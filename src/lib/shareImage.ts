import type { AdData } from "../types/ad";
import { renderPreviewCardBlob } from "./adPreviewCardCanvas";
import { resolveAdTheme } from "./adThemes";
import { renderQrToCanvas } from "./qrCanvas";
import { slugifyFilename } from "./socialCardRenderer";

/** Gera PNG 1080px do card para postagem manual ou Web Share API */
export async function generateShareCardBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  const themeDef = resolveAdTheme(ad.theme);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const qrCanvas = await renderQrToCanvas(qrUrl, 120, themeDef.qrFg);
  return renderPreviewCardBlob({
    adType: ad.t,
    title: ad.title,
    price: ad.price,
    description: ad.desc,
    icon: ad.icon,
    theme: ad.theme,
    billingRecorrente: ad.billingType === "recorrente",
    phone: ad.phone,
    qrCanvas,
    width: 1080,
  });
}

export function shareCardFilename(ad: AdData): string {
  return `anunciolink-${slugifyFilename(ad.title)}.png`;
}
