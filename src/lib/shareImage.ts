import type { AdData } from "../types/ad";
import { renderCardExportBlob } from "./adExportCanvas";
import { downloadBlob, slugifyFilename } from "./socialCardRenderer";

/** Gera JPG quadrado — mesma composição do cartaz A4, formato card */
export async function generateShareCardBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return renderCardExportBlob(ad, qrUrl);
}

export function shareCardFilename(ad: AdData): string {
  return `anunciolink-${slugifyFilename(ad.title)}.jpg`;
}

function openImagePreview(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) return;
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Baixa JPG do card e abre prévia para impressão */
export async function exportJpgCard(ad: AdData, qrUrl: string): Promise<void> {
  const blob = await generateShareCardBlob(ad, qrUrl);
  if (!blob.size) throw new Error("A imagem do card não foi gerada.");
  downloadBlob(blob, shareCardFilename(ad));
  openImagePreview(blob);
}
