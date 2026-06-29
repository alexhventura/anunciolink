import type { CropTransform } from "../types/ad";
import {
  drawCanvasBrandFooter,
  drawCanvasBrandMark,
  drawCanvasBrandWatermark,
} from "./brandCanvas";
import { CROP_VIEWPORT, DEFAULT_CROP, getCropSourceRect, loadImageElement } from "./imageCrop";

const SIZE = 1080;
const MUSTARD = "#d97706";
const INK = "#18181b";
const MUTED = "#71717a";
const WHITE = "#ffffff";
const SURFACE = "#fafafa";
const BORDER = "#e4e4e7";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
) {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 0 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

export interface SocialCardInput {
  title: string;
  price: string;
  imageSrc?: string;
  crop?: CropTransform;
  adUrl: string;
  qrCanvas: HTMLCanvasElement;
  billingRecorrente?: boolean;
  typeLabel?: string;
}

export async function renderSocialCard(input: SocialCardInput): Promise<Blob> {
  await document.fonts.load('900 48px "Inter"');
  await document.fonts.load('700 28px "Inter"');

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const pad = 56;
  const footerReserve = 36;
  const innerBottom = SIZE - pad - footerReserve;

  drawFrame(ctx, pad - 8, pad - 8, SIZE - pad * 2 + 16, SIZE - pad * 2 + 16, 24, WHITE);

  drawCanvasBrandWatermark(ctx, SIZE, SIZE, 0.07);
  drawCanvasBrandMark(ctx, SIZE - pad - 52, pad);

  if (input.typeLabel) {
    ctx.font = '700 22px Inter, Arial, sans-serif';
    const label = input.typeLabel.toUpperCase();
    const labelW = ctx.measureText(label).width + 40;
    drawFrame(ctx, pad, pad, labelW, 44, 8, SURFACE);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, pad + labelW / 2, pad + 22);
  }

  const photoSize = 500;
  const photoX = (SIZE - photoSize) / 2;
  const photoY = 128;

  if (input.imageSrc) {
    try {
      const img = await loadImageElement(input.imageSrc);
      const crop = input.crop ?? DEFAULT_CROP;
      const inner = photoSize - 6;
      drawFrame(ctx, photoX, photoY, photoSize, photoSize, 16, WHITE);
      ctx.save();
      roundRect(ctx, photoX + 3, photoY + 3, inner, inner, 14);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const { srcX, srcY, srcSize } = getCropSourceRect(img, crop, CROP_VIEWPORT);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, photoX + 3, photoY + 3, inner, inner);
      ctx.restore();
    } catch {
      drawFrame(ctx, photoX, photoY, photoSize, photoSize, 16, "#fef3c7");
      ctx.fillStyle = MUTED;
      ctx.font = '700 28px Inter, Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("Sem foto", SIZE / 2, photoY + photoSize / 2);
    }
  } else {
    drawFrame(ctx, photoX, photoY, photoSize, photoSize, 16, "#fef3c7");
    ctx.fillStyle = MUTED;
    ctx.font = '700 28px Inter, Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("Sem foto", SIZE / 2, photoY + photoSize / 2);
  }

  const priceText = input.price + (input.billingRecorrente ? " /mês" : "");
  ctx.font = '900 64px Inter, Arial, sans-serif';
  const priceW = Math.min(ctx.measureText(priceText).width + 56, SIZE - pad * 2);
  const priceH = 88;
  const priceX = (SIZE - priceW) / 2;
  const priceY = photoY + photoSize + 40;

  drawFrame(ctx, priceX, priceY, priceW, priceH, 12, "#fffbeb");
  ctx.fillStyle = MUSTARD;
  ctx.font = '900 52px Inter, Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(priceText, SIZE / 2, priceY + priceH / 2);

  ctx.font = '900 36px Inter, Arial, sans-serif';
  ctx.fillStyle = INK;
  const title = truncateText(ctx, input.title, SIZE - pad * 2 - 16);
  ctx.textAlign = "center";
  ctx.fillText(title, SIZE / 2, priceY + priceH + 52);

  const qrSize = 148;
  const qrX = pad;
  const qrY = innerBottom - qrSize;
  drawFrame(ctx, qrX, qrY, qrSize, qrSize, 10, WHITE);
  ctx.drawImage(input.qrCanvas, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);

  ctx.fillStyle = INK;
  ctx.font = '700 24px Inter, Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, "Escaneie e compre via PIX ou Cartão", qrX + qrSize + 28, qrY + 12, SIZE - qrX - qrSize - pad - 36, 30);

  drawCanvasBrandFooter(ctx, SIZE, SIZE - pad + 10, 17);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))),
      "image/png",
      1
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40)
      .toLowerCase() || "anuncio"
  );
}
