import type { AdData } from "../types/ad";
import { renderExportPosterBlob } from "./adExportCanvas";
import { downloadBlob, slugifyFilename } from "./socialCardRenderer";

export function exportPosterBasename(ad: AdData): string {
  return `anunciolink-${slugifyFilename(ad.title)}`;
}

export function shareCardFilename(ad: AdData): string {
  return `${exportPosterBasename(ad)}.jpg`;
}

export function exportPdfFilename(ad: AdData): string {
  return `${exportPosterBasename(ad)}.pdf`;
}

/** Gera JPG A4 — mesma imagem embutida no PDF, só muda a extensão */
export async function generateShareCardBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return renderExportPosterBlob(ad, qrUrl);
}

function openImagePreview(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) return;
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Baixa JPG A4 e abre prévia para impressão */
export async function exportJpgCard(ad: AdData, qrUrl: string): Promise<void> {
  const blob = await generateShareCardBlob(ad, qrUrl);
  if (!blob.size) throw new Error("A imagem do cartaz não foi gerada.");
  downloadBlob(blob, shareCardFilename(ad));
  openImagePreview(blob);
}
