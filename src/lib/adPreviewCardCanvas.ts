import type { AdType } from "../types/ad";
import { SITE_DOMAIN } from "./constants";
import type { AdIconId } from "./adIcons";
import { resolveAdIconId } from "./adIcons";
import { drawAdIconOnCanvas } from "./adIconCanvas";
import { formatPhoneNumber } from "./formatters";

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
const AMBER_100 = "#fef3c7";
const WHITE = "#ffffff";
const MUTED = "#71717a";

const TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

/** Espaçamentos padronizados do card social (1080px) */
const SP = {
  cardOuter: 56,
  cardBorder: 4,
  headerH: 300,
  bodyTop: 28,
  chipGap: 16,
  descLine: 30,
  beforeQr: 28,
  qrFramePad: 22,
  qrLabelGap: 22,
  phoneGap: 28,
  siteGap: 22,
  cardBottom: 48,
} as const;

const QR_INNER = 256;

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

function drawQrInFrame(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement,
  frameX: number,
  frameY: number,
  frameSize: number,
  innerSize: number
) {
  const pad = (frameSize - innerSize) / 2;

  ctx.fillStyle = WHITE;
  ctx.fillRect(frameX, frameY, frameSize, frameSize);
  drawStrokeRect(ctx, frameX, frameY, frameSize, frameSize, 4);

  const qrX = frameX + pad;
  const qrY = frameY + pad;
  ctx.drawImage(qrCanvas, 0, 0, qrCanvas.width, qrCanvas.height, qrX, qrY, innerSize, innerSize);
}

/** Card social 1080×1080 — QR protagonista, identidade Mostarda/Preto/Branco */
export async function renderPreviewCardCanvas(input: PreviewCardCanvasInput): Promise<HTMLCanvasElement> {
  const size = input.width ?? 1080;
  const pad = SP.cardOuter;
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
  drawStrokeRect(ctx, cardX, cardY, cardW, cardH, SP.cardBorder);

  const headerH = SP.headerH;
  ctx.fillStyle = AMBER_500;
  ctx.fillRect(cardX + SP.cardBorder, cardY + SP.cardBorder, cardW - SP.cardBorder * 2, headerH - SP.cardBorder);
  ctx.beginPath();
  ctx.moveTo(cardX + SP.cardBorder, cardY + headerH);
  ctx.lineTo(cardX + cardW - SP.cardBorder, cardY + headerH);
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

  let bodyY = cardY + headerH + SP.bodyTop;
  const bodyX = safeX;

  ctx.textAlign = "left";
  ctx.font = "800 13px system-ui, sans-serif";
  const chipW = ctx.measureText(typeLabel).width + 24;
  ctx.fillStyle = INK;
  ctx.fillRect(bodyX, bodyY, chipW, 30);
  ctx.fillStyle = AMBER_500;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, bodyX + chipW / 2, bodyY + 15);

  bodyY += 30 + SP.chipGap;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillStyle = INK;

  const qrFrameSize = QR_INNER + SP.qrFramePad * 2;
  const siteLineH = 20;
  const phoneLineH = phoneDisplay ? 36 : 0;
  const qrLabelLineH = 24;
  const footerBlockH =
    SP.cardBottom +
    siteLineH +
    (phoneDisplay ? SP.siteGap + phoneLineH : 0) +
    SP.phoneGap +
    qrLabelLineH +
    SP.qrLabelGap +
    qrFrameSize;

  const frameY = cardY + cardH - footerBlockH;
  const descBottom = frameY - SP.beforeQr;
  const maxDescLines = Math.max(2, Math.min(4, Math.floor((descBottom - bodyY) / SP.descLine)));
  drawWrappedText(ctx, description, bodyX, bodyY, safeW, SP.descLine, maxDescLines);

  if (input.qrCanvas) {
    const frameX = cardX + (cardW - qrFrameSize) / 2;
    drawQrInFrame(ctx, input.qrCanvas, frameX, frameY, qrFrameSize, QR_INNER);

    const centerX = cardX + cardW / 2;
    let cursorY = frameY + qrFrameSize + SP.qrLabelGap;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = INK;
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText("Escaneie para ver o anúncio", centerX, cursorY);
    cursorY += qrLabelLineH + SP.phoneGap;

    if (phoneDisplay) {
      ctx.font = "900 34px system-ui, sans-serif";
      ctx.fillText(phoneDisplay, centerX, cursorY);
      cursorY += phoneLineH + SP.siteGap;
    }

    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillStyle = MUTED;
    const siteY = cardY + cardH - SP.cardBottom - siteLineH;
    ctx.fillText(SITE_DOMAIN, centerX, siteY);
  }

  return canvas;
}

export async function renderPreviewCardBlob(input: PreviewCardCanvasInput, mime = "image/png"): Promise<Blob> {
  const canvas = await renderPreviewCardCanvas(input);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))), mime, 1);
  });
}
