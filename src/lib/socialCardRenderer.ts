const SIZE = 1080;
const MUSTARD = "#d97706";
const MUSTARD_SOFT = "#f59e0b";
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

function drawBrandMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const box = 52;
  drawFrame(ctx, x, y, box, box, 10, WHITE);
  ctx.fillStyle = INK;
  ctx.font = '900 26px Inter, Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", x + box / 2, y + box / 2 + 1);
  ctx.beginPath();
  ctx.fillStyle = MUSTARD_SOFT;
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 2;
  const zx = x + box - 10;
  const zy = y + 8;
  ctx.moveTo(zx, zy + 12);
  ctx.lineTo(zx - 3, zy);
  ctx.lineTo(zx + 2, zy + 5);
  ctx.lineTo(zx - 5, zy + 5);
  ctx.lineTo(zx, zy + 12);
  ctx.fill();
  ctx.stroke();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
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
  drawFrame(ctx, pad - 8, pad - 8, SIZE - pad * 2 + 16, SIZE - pad * 2 + 16, 24, WHITE);

  drawBrandMark(ctx, SIZE - pad - 52, pad);

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
      const img = await loadImage(input.imageSrc);
      drawFrame(ctx, photoX, photoY, photoSize, photoSize, 16, WHITE);
      ctx.save();
      roundRect(ctx, photoX + 3, photoY + 3, photoSize - 6, photoSize - 6, 14);
      ctx.clip();
      const scale = Math.max((photoSize - 6) / img.width, (photoSize - 6) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(
        img,
        photoX + 3 + (photoSize - 6 - dw) / 2,
        photoY + 3 + (photoSize - 6 - dh) / 2,
        dw,
        dh
      );
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
  const qrY = SIZE - pad - qrSize - 8;
  drawFrame(ctx, qrX, qrY, qrSize, qrSize, 10, WHITE);
  ctx.drawImage(input.qrCanvas, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);

  ctx.fillStyle = INK;
  ctx.font = '700 24px Inter, Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, "Escaneie e compre via PIX ou Cartão", qrX + qrSize + 28, qrY + 12, SIZE - qrX - qrSize - pad - 36, 30);

  ctx.font = '600 20px Inter, Arial, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText("anunciolink.com.br", qrX + qrSize + 28, SIZE - pad - 28);

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
