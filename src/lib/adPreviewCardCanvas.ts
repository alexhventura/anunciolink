import type { AdType } from "../types/ad";
import type { AdIconId } from "./adIcons";
import { resolveAdIconId } from "./adIcons";
import { drawAdIconOnCanvas } from "./adIconCanvas";
import { formatPhoneNumber } from "./formatters";

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
const AMBER_100 = "#fef3c7";
const WHITE = "#ffffff";
const MUTED = "#52525b";

const TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

const BRAND_NAME = "AnúncioLink";

export interface PreviewCardCanvasInput {
  adType: AdType;
  title: string;
  price: string;
  description: string;
  icon?: AdIconId;
  billingRecorrente?: boolean;
  phone?: string;
  width?: number;
  qrCanvas?: HTMLCanvasElement;
}

function drawStrokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineWidth = 4
) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, w - lineWidth, h - lineWidth);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
        if (lines.length >= maxLines) return lines;
      } else {
        line = test;
      }
    }

    if (line) {
      lines.push(line);
      if (lines.length >= maxLines) return lines;
    }
  }

  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const lines = wrapLines(ctx, text, maxWidth, maxLines);
  const clipped = lines.length >= maxLines && text.length > lines.join(" ").length;
  const displayLines = clipped
    ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]?.replace(/\s+$/, "")}…`]
    : lines;

  let cy = y;
  for (const line of displayLines) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

/** Card social 1080×1080 — QR protagonista, identidade Mostarda/Preto/Branco */
export async function renderPreviewCardCanvas(input: PreviewCardCanvasInput): Promise<HTMLCanvasElement> {
  const size = input.width ?? 1080;
  const pad = 56;
  const innerW = size - pad * 2;
  const safeX = pad + 32;
  const safeW = innerW - 64;

  const iconId = resolveAdIconId(input.icon, input.adType);
  const priceLabel = input.price + (input.billingRecorrente ? " /mês" : "");
  const typeLabel = TYPE_LABEL[input.adType].toUpperCase();
  const phoneDisplay = input.phone ? formatPhoneNumber(input.phone) : "";
  const title = input.title.trim() || "Título do anúncio";
  const description = input.description.trim() || "Descrição do anúncio.";

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = AMBER_100;
  ctx.fillRect(0, 0, size, size);

  const cardX = pad;
  const cardY = pad;
  const cardW = innerW;
  const cardH = innerW;

  ctx.fillStyle = WHITE;
  ctx.fillRect(cardX, cardY, cardW, cardH);
  drawStrokeRect(ctx, cardX, cardY, cardW, cardH, 4);

  const headerH = 300;
  ctx.fillStyle = AMBER_500;
  ctx.fillRect(cardX + 4, cardY + 4, cardW - 8, headerH - 4);
  ctx.beginPath();
  ctx.moveTo(cardX + 4, cardY + headerH);
  ctx.lineTo(cardX + cardW - 4, cardY + headerH);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();

  const iconBox = 128;
  const iconBoxX = cardX + (cardW - iconBox) / 2;
  const iconBoxY = cardY + 28;
  ctx.fillStyle = WHITE;
  ctx.fillRect(iconBoxX, iconBoxY, iconBox, iconBox);
  drawStrokeRect(ctx, iconBoxX, iconBoxY, iconBox, iconBox, 4);
  await drawAdIconOnCanvas(ctx, iconId, cardX + cardW / 2, iconBoxY + iconBox / 2 + 4, 72, INK);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "900 42px system-ui, sans-serif";
  drawWrappedText(ctx, title, cardX + cardW / 2, iconBoxY + iconBox + 20, safeW, 48, 2);

  ctx.font = "900 36px system-ui, sans-serif";
  ctx.fillText(priceLabel || "—", cardX + cardW / 2, cardY + headerH - 58);

  let bodyY = cardY + headerH + 28;
  const bodyX = safeX;

  ctx.textAlign = "left";
  ctx.font = "800 13px system-ui, sans-serif";
  const chipText = typeLabel;
  const chipW = ctx.measureText(chipText).width + 24;
  ctx.fillStyle = INK;
  ctx.fillRect(bodyX, bodyY, chipW, 30);
  ctx.fillStyle = AMBER_500;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(chipText, bodyX + chipW / 2, bodyY + 15);

  bodyY += 46;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillStyle = INK;

  const footerReserve = input.qrCanvas ? 380 : 72;
  const descLineHeight = 30;
  const maxDescLines = Math.max(
    2,
    Math.min(4, Math.floor((cardY + cardH - footerReserve - bodyY) / descLineHeight))
  );
  drawWrappedText(ctx, description, bodyX, bodyY, safeW, descLineHeight, maxDescLines);

  const qrSize = input.qrCanvas ? 280 : 0;
  const qrBlockH = qrSize ? qrSize + 72 : 0;
  const qrY = cardY + cardH - qrBlockH - 52;

  if (input.qrCanvas && qrSize > 0) {
    const qrX = cardX + (cardW - qrSize) / 2;
    ctx.fillStyle = WHITE;
    ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
    drawStrokeRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 4);

    ctx.shadowColor = INK;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = WHITE;
    ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
    ctx.shadowColor = "transparent";

    ctx.drawImage(input.qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = INK;
    ctx.font = "800 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Escaneie para ver o anúncio", cardX + cardW / 2, qrY + qrSize + 20);
  }

  if (phoneDisplay) {
    ctx.fillStyle = MUTED;
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(phoneDisplay, cardX + cardW / 2, cardY + cardH - 36);
  }

  ctx.fillStyle = MUTED;
  ctx.font = "800 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.12em";
  ctx.fillText(BRAND_NAME.toUpperCase(), cardX + cardW / 2, cardY + cardH - 18);
  ctx.letterSpacing = "0";

  return canvas;
}

export async function renderPreviewCardBlob(input: PreviewCardCanvasInput, mime = "image/png"): Promise<Blob> {
  const canvas = await renderPreviewCardCanvas(input);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))), mime, 1);
  });
}
