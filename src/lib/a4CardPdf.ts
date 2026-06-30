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

async function buildA4CardPdf(ad: AdData, qrUrl: string): Promise<jsPDF> {
  const cardBlob = await generateShareCardBlob(ad, qrUrl);
  const dataUrl = await blobToDataUrl(cardBlob);

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

  pdf.addImage(dataUrl, "PNG", x, y, cardMm, cardMm, undefined, "FAST");

  return pdf;
}

function printPdfBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      iframe.remove();
      fn();
    };

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) {
        finish(() => reject(new Error("Não foi possível abrir o diálogo de impressão.")));
        return;
      }

      const onAfterPrint = () => finish(resolve);
      win.addEventListener("afterprint", onAfterPrint, { once: true });
      win.focus();
      win.print();

      window.setTimeout(() => {
        if (!settled) finish(resolve);
      }, 120_000);
    };

    iframe.onerror = () => {
      finish(() => reject(new Error("Falha ao carregar PDF para impressão.")));
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}

/**
 * Gera PDF A4 com o card do anúncio centralizado (mesma arte do PNG social)
 * e abre o diálogo de impressão — no Chrome, use "Guardar como PDF".
 */
export async function printA4CardPdf(ad: AdData, qrUrl: string): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl);

  try {
    await printPdfBlob(pdf.output("blob") as Blob);
  } catch {
    pdf.save(pdfFilename(ad));
  }
}

/** Baixa o PDF A4 sem abrir o diálogo de impressão */
export async function downloadA4CardPdf(ad: AdData, qrUrl: string): Promise<void> {
  const pdf = await buildA4CardPdf(ad, qrUrl);
  pdf.save(pdfFilename(ad));
}
