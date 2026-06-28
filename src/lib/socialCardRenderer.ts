const SIZE = 1080;
const MUSTARD = "#f59e0b";
const MUSTARD_LIGHT = "#fbbf24";
const BLACK = "#000000";
const WHITE = "#ffffff";
const AMBER_TEXT = "#fbbf24";

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

function drawSolidShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  offset: number,
  fill: string
) {
  ctx.fillStyle = BLACK;
  roundRect(ctx, x + offset, y + offset, w, h, r);
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 8;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function drawBrandMark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const box = 56 * scale;
  drawSolidShadow(ctx, x, y, box, box, 10 * scale, 6 * scale, MUSTARD_LIGHT);
  ctx.fillStyle = BLACK;
  ctx.font = `900 ${28 * scale}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", x + box / 2, y + box / 2 + 2 * scale);
  ctx.beginPath();
  ctx.fillStyle = MUSTARD_LIGHT;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 3 * scale;
  const zx = x + box - 8 * scale;
  const zy = y + 6 * scale;
  ctx.moveTo(zx, zy + 14 * scale);
  ctx.lineTo(zx - 4 * scale, zy);
  ctx.lineTo(zx + 2 * scale, zy + 6 * scale);
  ctx.lineTo(zx - 6 * scale, zy + 6 * scale);
  ctx.lineTo(zx, zy + 14 * scale);
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
  await document.fonts.load('800 36px "Inter"');

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  ctx.fillStyle = MUSTARD;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, SIZE - 12, SIZE - 12);

  drawBrandMark(ctx, SIZE - 100, 36, 1);

  if (input.typeLabel) {
    ctx.fillStyle = BLACK;
    ctx.font = '900 28px Inter, Arial, sans-serif';
    const labelW = ctx.measureText(input.typeLabel.toUpperCase()).width + 48;
    drawSolidShadow(ctx, 48, 48, labelW, 52, 8, 5, WHITE);
    ctx.fillStyle = BLACK;
    ctx.font = '900 24px Inter, Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(input.typeLabel.toUpperCase(), 48 + labelW / 2, 48 + 26);
  }

  const photoSize = 520;
  const photoX = (SIZE - photoSize) / 2;
  const photoY = 140;

  if (input.imageSrc) {
    try {
      const img = await loadImage(input.imageSrc);
      drawSolidShadow(ctx, photoX, photoY, photoSize, photoSize, 16, 10, WHITE);
      ctx.save();
      roundRect(ctx, photoX + 4, photoY + 4, photoSize - 8, photoSize - 8, 12);
      ctx.clip();
      const scale = Math.max((photoSize - 8) / img.width, (photoSize - 8) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(
        img,
        photoX + 4 + (photoSize - 8 - dw) / 2,
        photoY + 4 + (photoSize - 8 - dh) / 2,
        dw,
        dh
      );
      ctx.restore();
    } catch {
      drawSolidShadow(ctx, photoX, photoY, photoSize, photoSize, 16, 10, "#fde68a");
      ctx.fillStyle = BLACK;
      ctx.font = '800 32px Inter, Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("SEM FOTO", SIZE / 2, photoY + photoSize / 2);
    }
  } else {
    drawSolidShadow(ctx, photoX, photoY, photoSize, photoSize, 16, 10, "#fde68a");
    ctx.fillStyle = BLACK;
    ctx.font = '800 32px Inter, Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("SEM FOTO", SIZE / 2, photoY + photoSize / 2);
  }

  const priceText =
    input.price + (input.billingRecorrente ? " /mês" : "");
  ctx.font = '900 72px Inter, Arial, sans-serif';
  const priceW = Math.min(ctx.measureText(priceText).width + 64, SIZE - 96);
  const priceH = 96;
  const priceX = (SIZE - priceW) / 2;
  const priceY = photoY + photoSize + 36;
  drawSolidShadow(ctx, priceX, priceY, priceW, priceH, 12, 8, BLACK);
  ctx.fillStyle = AMBER_TEXT;
  ctx.font = '900 56px Inter, Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(priceText, SIZE / 2, priceY + priceH / 2);

  ctx.font = '900 40px Inter, Arial, sans-serif';
  ctx.fillStyle = BLACK;
  const title = truncateText(ctx, input.title, SIZE - 120);
  ctx.textAlign = "center";
  ctx.fillText(title, SIZE / 2, priceY + priceH + 56);

  const qrSize = 160;
  const qrX = 48;
  const qrY = SIZE - qrSize - 48;
  drawSolidShadow(ctx, qrX, qrY, qrSize, qrSize, 10, 6, WHITE);
  ctx.drawImage(input.qrCanvas, qrX + 8, qrY + 8, qrSize - 16, qrSize - 16);

  ctx.fillStyle = BLACK;
  ctx.font = '800 22px Inter, Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const ctaX = qrX + qrSize + 24;
  const ctaMax = SIZE - ctaX - 48;
  wrapText(
    ctx,
    "Escaneie e compre via PIX ou Cartão!",
    ctaX,
    qrY + 16,
    ctaMax,
    28
  );

  ctx.font = '700 18px Inter, Arial, sans-serif';
  ctx.fillStyle = "#422006";
  ctx.fillText("anunciolink.com.br", ctaX, SIZE - 72);

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
