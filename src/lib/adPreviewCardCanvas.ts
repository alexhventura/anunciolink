import type { AdType } from "../types/ad";
import { resolveAdIcon } from "./adIcons";
import { loadExternalImageElement } from "./externalImageUrl";
import { isExternalImageUrl, resolveRenderableImageSrc } from "./imageUtils";
import { formatPhoneNumber } from "./formatters";
import { DEFAULT_CROP, getCropSourceRect, loadImageElement } from "./imageCrop";

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
const AMBER_400 = "#fbbf24";
const AMBER_100 = "#fef3c7";
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
  icon?: string;
  imageSrc?: string;
  billingRecorrente?: boolean;
  phone?: string;
  width?: number;
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

function drawEmojiIcon(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  x: number,
  y: number,
  size: number
) {
  drawRect(ctx, x, y, size, size);
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, AMBER_100);
  gradient.addColorStop(1, WHITE);
  ctx.fillStyle = gradient;
  ctx.fillRect(x + 3, y + 3, size - 6, size - 6);

  ctx.font = `${Math.round(size * 0.48)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + size / 2, y + size / 2 + 4);
}

async function drawHeroVisual(
  ctx: CanvasRenderingContext2D,
  input: PreviewCardCanvasInput,
  x: number,
  y: number,
  size: number
) {
  const resolved = resolveRenderableImageSrc(input.imageSrc);
  if (resolved) {
    drawRect(ctx, x, y, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 3, y + 3, size - 6, size - 6);
    ctx.clip();
    try {
      const img = isExternalImageUrl(resolved)
        ? await loadExternalImageElement(resolved)
        : await loadImageElement(resolved);
      const { srcX, srcY, srcSize } = getCropSourceRect(img, DEFAULT_CROP, 150);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, x + 3, y + 3, size - 6, size - 6);
      ctx.restore();
      return;
    } catch {
      ctx.restore();
    }
  }
  drawEmojiIcon(ctx, resolveAdIcon(input.icon, input.adType), x, y, size);
}

/** Renderiza o card idêntico ao AdPreviewCard (neo-brutalist) em canvas */
export async function renderPreviewCardCanvas(input: PreviewCardCanvasInput): Promise<HTMLCanvasElement> {
  const canvasW = input.width ?? 1080;
  const pad = 48;
  const cardW = canvasW - pad * 2;
  const iconSize = Math.round(Math.min(220, cardW * 0.38));
  const innerPad = 36;
  const contentW = cardW - innerPad * 2;

  const priceLabel = input.price + (input.billingRecorrente ? " /mês" : "");
  const typeLabel = TYPE_LABEL[input.adType].toUpperCase();
  const phoneDisplay = input.phone ? formatPhoneNumber(input.phone) : "";

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;

  mctx.font = "900 30px system-ui, sans-serif";
  const titleLines = Math.min(4, Math.ceil(mctx.measureText(input.title || "Título").width / contentW) + 1);

  mctx.font = "500 17px system-ui, sans-serif";
  const descLineCount = Math.min(
    14,
    Math.max(2, Math.ceil((input.description || "").length / Math.max(1, Math.floor(contentW / 9))))
  );

  const heroH = innerPad + iconSize + innerPad;
  const chipH = 34;
  const titleH = titleLines * 36;
  const priceH = 56;
  const descH = descLineCount * 24 + 16;
  const bodyH = innerPad + chipH + 14 + titleH + 16 + priceH + 16 + descH + innerPad;
  const footerH = input.qrCanvas ? (phoneDisplay ? 220 : 190) : phoneDisplay ? 56 : 0;
  const canvasH = pad + heroH + 3 + bodyH + footerH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 0, canvasW, canvasH);

  let y = pad;
  const cardX = pad;
  const cardH = heroH + 3 + bodyH + footerH;

  ctx.fillStyle = WHITE;
  ctx.shadowColor = INK;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.fillRect(cardX, y, cardW, cardH);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX, y, cardW, cardH);

  const iconX = cardX + (cardW - iconSize) / 2;
  const iconY = y + innerPad;
  await drawHeroVisual(ctx, input, iconX, iconY, iconSize);

  y += heroH;
  ctx.fillStyle = INK;
  ctx.fillRect(cardX, y, cardW, 3);

  y += 3;
  ctx.fillStyle = AMBER_500;
  ctx.fillRect(cardX + 3, y, cardW - 6, bodyH - 3);

  let cy = y + innerPad;
  const cx = cardX + innerPad;

  ctx.fillStyle = INK;
  ctx.font = "800 13px system-ui, sans-serif";
  const chipW = ctx.measureText(typeLabel).width + 28;
  ctx.fillRect(cx, cy, chipW, chipH);
  ctx.fillStyle = AMBER_400;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, cx + chipW / 2, cy + chipH / 2);

  cy += chipH + 14;
  ctx.fillStyle = INK;
  ctx.font = "900 30px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapParagraph(ctx, input.title || "Título do anúncio", cx, cy, contentW, 36, 4);

  cy += titleH + 8;
  ctx.font = "900 28px system-ui, sans-serif";
  const priceTextW = Math.min(ctx.measureText(priceLabel || "—").width + 36, contentW);
  ctx.fillStyle = WHITE;
  drawRect(ctx, cx, cy, priceTextW, priceH);
  ctx.fillStyle = INK;
  ctx.textBaseline = "middle";
  ctx.fillText(priceLabel || "—", cx + 18, cy + priceH / 2);

  cy += priceH + 16;
  ctx.font = "500 17px system-ui, sans-serif";
  ctx.fillStyle = "rgba(24,24,27,0.85)";
  ctx.textBaseline = "top";
  wrapParagraph(ctx, input.description || "Descrição aparecerá aqui.", cx, cy, contentW, 24, descLineCount);

  if (footerH > 0) {
    const footerY = y + bodyH;
    ctx.fillStyle = WHITE;
    ctx.fillRect(cardX + 3, footerY, cardW - 6, footerH - 3);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + innerPad, footerY);
    ctx.lineTo(cardX + cardW - innerPad, footerY);
    ctx.stroke();

    let fy = footerY + 20;

    if (phoneDisplay) {
      ctx.fillStyle = INK;
      ctx.font = "700 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`📞 ${phoneDisplay}`, cardX + cardW / 2, fy);
      fy += 40;
    }

    if (input.qrCanvas) {
      const qrSize = 140;
      const qrX = cardX + (cardW - qrSize) / 2;
      drawRect(ctx, qrX, fy, qrSize, qrSize);
      ctx.drawImage(input.qrCanvas, qrX + 10, fy + 10, qrSize - 20, qrSize - 20);

      ctx.fillStyle = INK;
      ctx.font = "700 17px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Escaneie para ver o anúncio completo", cardX + cardW / 2, fy + qrSize + 22);
    }
  }

  return canvas;
}

export async function renderPreviewCardBlob(input: PreviewCardCanvasInput, mime = "image/png"): Promise<Blob> {
  const canvas = await renderPreviewCardCanvas(input);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))), mime, 1);
  });
}
