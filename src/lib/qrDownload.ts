import { downloadBlob } from "./socialCardRenderer";

/** Baixa canvas do QR Code como PNG */
export async function downloadQrPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 1);
  });
  if (!blob) throw new Error("Falha ao gerar PNG");
  downloadBlob(blob, filename);
}
