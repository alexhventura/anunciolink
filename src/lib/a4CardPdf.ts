import { jsPDF } from "jspdf";
import type { AdData } from "../types/ad";
import type { ExportQrPreference } from "./exportQr";
import { renderA4PosterBlob } from "./adExportCanvas";
import { exportPdfFilename, shareCardFilename } from "./shareImage";

const A4_W_MM = 210;
const A4_H_MM = 297;
const PAGE_BG = { r: 255, g: 255, b: 255 } as const;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler imagem do cartaz."));
    reader.readAsDataURL(blob);
  });
}

function pdfFilename(ad: AdData): string {
  return exportPdfFilename(ad);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function openPdfPreview(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) return;
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

async function buildA4CardPdf(ad: AdData, qrUrl: string, qrPreference: ExportQrPreference = "ad"): Promise<jsPDF> {
  const posterBlob = await renderA4PosterBlob(ad, qrUrl, qrPreference);
  if (!posterBlob.size) {
    throw new Error("A imagem do cartaz não foi gerada.");
  }

  const dataUrl = await blobToDataUrl(posterBlob);
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Formato de imagem do cartaz inválido.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.setFillColor(PAGE_BG.r, PAGE_BG.g, PAGE_BG.b);
  pdf.rect(0, 0, A4_W_MM, A4_H_MM, "F");

  const format = dataUrl.includes("image/png") ? "PNG" : "JPEG";
  pdf.addImage(dataUrl, format, 0, 0, A4_W_MM, A4_H_MM, undefined, "SLOW");

  return pdf;
}

/**
 * Gera PDF A4 com layout de cartaz (grade 2×2), baixa o arquivo e abre prévia.
 */
export async function printA4CardPdf(
  ad: AdData,
  qrUrl: string,
  qrPreference: ExportQrPreference = "ad"
): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl, qrPreference);
  const filename = pdfFilename(ad);
  const blob = pdf.output("blob") as Blob;

  if (!blob.size) {
    throw new Error("O PDF do cartaz ficou vazio.");
  }

  downloadBlob(blob, filename);
  openPdfPreview(blob);
}

/** Baixa o PDF A4 sem abrir prévia */
export async function downloadA4CardPdf(
  ad: AdData,
  qrUrl: string,
  qrPreference: ExportQrPreference = "ad"
): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl, qrPreference);
  downloadBlob(pdf.output("blob") as Blob, pdfFilename(ad));
}
