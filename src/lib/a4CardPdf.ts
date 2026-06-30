import { jsPDF } from "jspdf";
import type { AdData } from "../types/ad";
import { generateShareCardBlob, shareCardFilename } from "./shareImage";

const A4_W_MM = 210;
const A4_H_MM = 297;
const PAGE_MARGIN_MM = 12;
const PAGE_BG = { r: 255, g: 251, b: 235 } as const;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler imagem do card."));
    reader.readAsDataURL(blob);
  });
}

function pdfFilename(ad: AdData): string {
  return shareCardFilename(ad).replace(/\.png$/i, "-a4.pdf");
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

async function buildA4CardPdf(ad: AdData, qrUrl: string): Promise<jsPDF> {
  const cardBlob = await generateShareCardBlob(ad, qrUrl);
  if (!cardBlob.size) {
    throw new Error("A imagem do card não foi gerada.");
  }

  const dataUrl = await blobToDataUrl(cardBlob);
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Formato de imagem do card inválido.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.setFillColor(PAGE_BG.r, PAGE_BG.g, PAGE_BG.b);
  pdf.rect(0, 0, A4_W_MM, A4_H_MM, "F");

  const innerW = A4_W_MM - PAGE_MARGIN_MM * 2;
  const innerH = A4_H_MM - PAGE_MARGIN_MM * 2;
  const cardMm = Math.min(innerW, innerH);
  const x = (A4_W_MM - cardMm) / 2;
  const y = (A4_H_MM - cardMm) / 2;

  pdf.addImage(dataUrl, "PNG", x, y, cardMm, cardMm, undefined, "MEDIUM");

  return pdf;
}

/**
 * Gera PDF A4 com o card centralizado, baixa o arquivo e abre prévia em nova aba.
 */
export async function printA4CardPdf(ad: AdData, qrUrl: string): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl);
  const filename = pdfFilename(ad);
  const blob = pdf.output("blob") as Blob;

  if (!blob.size) {
    throw new Error("O PDF do cartaz ficou vazio.");
  }

  downloadBlob(blob, filename);
  openPdfPreview(blob);
}

/** Baixa o PDF A4 sem abrir prévia */
export async function downloadA4CardPdf(ad: AdData, qrUrl: string): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl);
  downloadBlob(pdf.output("blob") as Blob, pdfFilename(ad));
}
