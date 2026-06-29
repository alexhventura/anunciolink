import type { AdType, BillingType, CropTransform } from "../types/ad";
import { DEFAULT_CROP, getCropSourceRect, loadImageElement } from "./imageCrop";

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
const AMBER_400 = "#fbbf24";
const WHITE = "#ffffff";

const TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

export interface PreviewCardCanvasInput {
  adType: AdType;
  title: string;
  price: string;
  description: string;
  imageSrc?: string;
  crop?: CropTransform;
  billingRecorrente?: boolean;
  /** Largura total do canvas exportado */
  width?: number;
  /** Altura total — se omitida, calculada pelo conteúdo */
  height?: number;
  /** Inclui QR no rodapé (cartaz / card com link) */
  qrCanvas?: HTMLCanvasElement;
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const paragraphs = text.split("\n");
  let cy = y;
  let linesUsed = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/(\s+)/).filter((w) => w.length > 0);
    let line = "";

    for (const word of words) {
      const test = line + word;
      if (ctx.measureText(test).width > maxWidth && line.trim()) {
        ctx.fillText(line.trimEnd(), x, cy);
        cy += lineHeight;
        linesUsed++;
        line = word.trimStart();
        if (linesUsed >= maxLines) return cy;
      } else {
        line = test;
      }
    }

    if (line.trim()) {
      ctx.fillText(line.trimEnd(), x, cy);
      cy += lineHeight;
      linesUsed++;
      if (linesUsed >= maxLines) return cy;
    }
  }

  return cy;
}

async function drawProductPhoto(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  x: number,
  y: number,
  size: number,
  crop = DEFAULT_CROP
) {
  drawRect(ctx, x, y, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 3, y + 3, size - 6, size - 6);
  ctx.clip();
  try {
    const img = await loadImageElement(imageSrc);
    const { srcX, srcY, srcSize } = getCropSourceRect(img, crop, 150);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, x + 3, y + 3, size - 6, size - 6);
  } catch {
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
    ctx.fillStyle = "#71717a";
    ctx.font = "600 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sem foto", x + size / 2, y + size / 2);
  }
  ctx.restore();
}

/** Renderiza o card idêntico ao AdPreviewCard (neo-brutalist) em canvas */
export async function renderPreviewCardCanvas(input: PreviewCardCanvasInput): Promise<HTMLCanvasElement> {
  const canvasW = input.width ?? 1080;
  const pad = 40;
  const cardW = canvasW - pad * 2;
  const photoSize = Math.round(Math.min(400, cardW * 0.42));
  const innerPad = 32;
  const contentW = cardW - innerPad * 2;

  const priceLabel = input.price + (input.billingRecorrente ? " /mês" : "");
  const typeLabel = TYPE_LABEL[input.adType].toUpperCase();

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;

  mctx.font = "900 28px system-ui, sans-serif";
  const titleLines = Math.min(3, Math.ceil(mctx.measureText(input.title || "Título").width / contentW) + 1);

  mctx.font = "500 16px system-ui, sans-serif";
  const descLineCount = Math.min(
    12,
    Math.max(2, Math.ceil((input.description || "").length / Math.max(1, Math.floor(contentW / 9))))
  );

  const topH = innerPad + photoSize + 24 + innerPad;
  const chipH = 32;
  const titleH = titleLines * 34;
  const priceH = 52;
  const descH = descLineCount * 22 + 16;
  const amberH = innerPad + chipH + 12 + titleH + 16 + priceH + 16 + descH + innerPad;
  const qrBlockH = input.qrCanvas ? 180 : 0;
  const canvasH = input.height ?? pad + topH + 3 + amberH + qrBlockH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 0, canvasW, canvasH);

  let y = pad;
  const cardX = pad;

  ctx.fillStyle = WHITE;
  drawRect(ctx, cardX, y, cardW, topH + 3 + amberH);
  ctx.shadowColor = INK;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = WHITE;
  ctx.fillRect(cardX, y, cardW, topH + 3 + amberH);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX, y, cardW, topH + 3 + amberH);

  const photoX = cardX + (cardW - photoSize) / 2;
  const photoY = y + innerPad;
  if (input.imageSrc) {
    await drawProductPhoto(ctx, input.imageSrc, photoX, photoY, photoSize, input.crop);
  } else {
    drawRect(ctx, photoX, photoY, photoSize, photoSize);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(photoX + 3, photoY + 3, photoSize - 6, photoSize - 6);
  }

  y += topH;
  ctx.fillStyle = INK;
  ctx.fillRect(cardX, y, cardW, 3);

  y += 3;
  ctx.fillStyle = AMBER_500;
  ctx.fillRect(cardX + 3, y, cardW - 6, amberH - 3);

  let cy = y + innerPad;
  const cx = cardX + innerPad;

  ctx.fillStyle = INK;
  ctx.font = "800 12px system-ui, sans-serif";
  const chipW = ctx.measureText(typeLabel).width + 24;
  ctx.fillRect(cx, cy, chipW, chipH);
  ctx.fillStyle = AMBER_400;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, cx + chipW / 2, cy + chipH / 2);

  cy += chipH + 12;
  ctx.fillStyle = INK;
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapParagraph(ctx, input.title || "Título do anúncio", cx, cy, contentW, 34, 3);

  cy += titleH + 8;
  ctx.font = "900 26px system-ui, sans-serif";
  const priceTextW = Math.min(ctx.measureText(priceLabel || "—").width + 32, contentW);
  ctx.fillStyle = WHITE;
  drawRect(ctx, cx, cy, priceTextW, priceH);
  ctx.fillStyle = INK;
  ctx.textBaseline = "middle";
  ctx.fillText(priceLabel || "—", cx + 16, cy + priceH / 2);

  cy += priceH + 16;
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillStyle = "rgba(24,24,27,0.85)";
  ctx.textBaseline = "top";
  wrapParagraph(
    ctx,
    input.description || "Descrição aparecerá aqui.",
    cx,
    cy,
    contentW,
    22,
    descLineCount
  );

  if (input.qrCanvas) {
    const qrY = y + amberH + 24;
    const qrSize = 140;
    const qrX = cardX + (cardW - qrSize) / 2;
    ctx.fillStyle = WHITE;
    drawRect(ctx, qrX, qrY, qrSize, qrSize);
    ctx.drawImage(input.qrCanvas, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);

    ctx.fillStyle = INK;
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Escaneie para ver o anúncio completo", cardX + cardW / 2, qrY + qrSize + 28);
  }

  return canvas;
}

export async function renderPreviewCardBlob(input: PreviewCardCanvasInput, mime = "image/png"): Promise<Blob> {
  const canvas = await renderPreviewCardCanvas(input);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))), mime, 1);
  });
}
