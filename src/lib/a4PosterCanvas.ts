import type { AdData, AdType } from "../types/ad";
import { drawAdIconOnCanvas } from "./adIconCanvas";
import { isValidAdIconId, usesBrandMarkIcon } from "./adIcons";
import { drawCanvasBrandMarkCentered } from "./brandCanvas";
import { SITE_DOMAIN } from "./constants";
import { formatPhoneNumber } from "./formatters";
import { renderQrToCanvas } from "./qrCanvas";
import { AD_QR_FOREGROUND } from "./adThemes";

/** A4 retrato @ 150 DPI — proporção 210×297 mm */
export const A4_POSTER_WIDTH = 1240;
export const A4_POSTER_HEIGHT = 1754;

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

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
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
  maxLines = 999
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

function drawCell(ctx: CanvasRenderingContext2D, rect: Rect, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  drawStrokeRect(ctx, rect.x, rect.y, rect.w, rect.h, 4);
}

function layoutGrid(width: number, height: number) {
  const margin = 40;
  const gap = 20;
  const contentW = width - margin * 2;
  const contentH = height - margin * 2;
  const cellW = (contentW - gap) / 2;
  const cellH = (contentH - gap) / 2;

  return {
    tl: { x: margin, y: margin, w: cellW, h: cellH },
    tr: { x: margin + cellW + gap, y: margin, w: cellW, h: cellH },
    bl: { x: margin, y: margin + cellH + gap, w: cellW, h: cellH },
    br: { x: margin + cellW + gap, y: margin + cellH + gap, w: cellW, h: cellH },
  };
}

function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  typeLabel: string,
  title: string
) {
  const pad = 28;
  const innerX = rect.x + pad;
  const innerW = rect.w - pad * 2;
  let y = rect.y + pad;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "800 14px system-ui, sans-serif";
  const chipW = ctx.measureText(typeLabel).width + 24;
  ctx.fillStyle = INK;
  ctx.fillRect(innerX, y, chipW, 28);
  ctx.fillStyle = AMBER_500;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, innerX + chipW / 2, y + 14);
  y += 28 + 20;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = "900 34px system-ui, sans-serif";
  const titleLines = wrapLines(ctx, title, innerW, 4);
  const titleLineH = 42;
  for (const line of titleLines) {
    ctx.fillText(line, innerX, y);
    y += titleLineH;
  }

  return y + 12;
}

function drawDescriptionBlock(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  startY: number,
  description: string
) {
  const pad = 28;
  const innerX = rect.x + pad;
  const innerW = rect.w - pad * 2;
  const bottom = rect.y + rect.h - pad;
  const availableH = bottom - startY;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;

  for (let fontSize = 22; fontSize >= 15; fontSize -= 1) {
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
    const lineHeight = Math.round(fontSize * 1.38);
    const lines = wrapLines(ctx, description, innerW, 999);
    if (lines.length * lineHeight <= availableH) {
      let y = startY;
      for (const line of lines) {
        ctx.fillText(line, innerX, y);
        y += lineHeight;
      }
      return;
    }
  }

  ctx.font = "600 15px system-ui, sans-serif";
  const lineHeight = 21;
  const maxLines = Math.max(1, Math.floor(availableH / lineHeight));
  const lines = wrapLines(ctx, description, innerW, maxLines);
  const clipped = description.length > lines.join(" ").length;
  const display = clipped
    ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]?.replace(/\s+$/, "")}…`]
    : lines;
  let y = startY;
  for (const line of display) {
    ctx.fillText(line, innerX, y);
    y += lineHeight;
  }
}

async function drawIconPriceCell(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  ad: AdData,
  priceLabel: string
) {
  drawCell(ctx, rect, AMBER_500);

  const useBrandMark = usesBrandMarkIcon(ad.icon);
  const iconId = useBrandMark || !isValidAdIconId(ad.icon) ? undefined : ad.icon;
  const iconSize = Math.min(rect.w, rect.h) * 0.38;
  const iconCenterY = rect.y + rect.h * 0.38;

  ctx.fillStyle = WHITE;
  const iconBox = iconSize + 32;
  const iconBoxX = rect.x + (rect.w - iconBox) / 2;
  const iconBoxY = iconCenterY - iconBox / 2;
  ctx.fillRect(iconBoxX, iconBoxY, iconBox, iconBox);
  drawStrokeRect(ctx, iconBoxX, iconBoxY, iconBox, iconBox, 4);

  const cx = rect.x + rect.w / 2;
  const cy = iconCenterY + 4;
  if (useBrandMark) {
    drawCanvasBrandMarkCentered(ctx, cx, cy, iconSize);
  } else {
    await drawAdIconOnCanvas(ctx, iconId!, cx, cy, iconSize, INK);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = INK;
  ctx.font = `900 ${Math.round(Math.min(rect.w * 0.11, 52))}px system-ui, sans-serif`;
  ctx.fillText(priceLabel || "—", rect.x + rect.w / 2, rect.y + rect.h - 36);
}

function drawQrCell(ctx: CanvasRenderingContext2D, rect: Rect, qrCanvas: HTMLCanvasElement) {
  drawCell(ctx, rect, WHITE);

  const pad = 36;
  const maxQr = Math.min(rect.w, rect.h) - pad * 2;
  const frameX = rect.x + (rect.w - maxQr) / 2;
  const frameY = rect.y + (rect.h - maxQr) / 2;

  ctx.fillStyle = WHITE;
  ctx.fillRect(frameX, frameY, maxQr, maxQr);
  drawStrokeRect(ctx, frameX, frameY, maxQr, maxQr, 4);

  const innerPad = 16;
  const innerSize = maxQr - innerPad * 2;
  ctx.drawImage(
    qrCanvas,
    0,
    0,
    qrCanvas.width,
    qrCanvas.height,
    frameX + innerPad,
    frameY + innerPad,
    innerSize,
    innerSize
  );
}

function drawMetaCell(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  phoneDisplay: string,
  title: string
) {
  drawCell(ctx, rect, AMBER_100);

  const pad = 32;
  const centerX = rect.x + rect.w / 2;
  let y = rect.y + pad + 24;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.fillText("Escaneie o QR Code", centerX, y);
  y += 38;

  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillStyle = MUTED;
  const scanLines = wrapLines(ctx, "Aponte a câmera do celular para abrir o anúncio completo.", rect.w - pad * 2, 3);
  for (const line of scanLines) {
    ctx.fillText(line, centerX, y);
    y += 30;
  }

  y += 16;

  if (phoneDisplay) {
    ctx.fillStyle = INK;
    ctx.font = "900 36px system-ui, sans-serif";
    ctx.fillText(phoneDisplay, centerX, y);
    y += 52;
  }

  ctx.fillStyle = INK;
  ctx.font = "800 20px system-ui, sans-serif";
  const titleShort = wrapLines(ctx, title, rect.w - pad * 2, 2);
  for (const line of titleShort) {
    ctx.fillText(line, centerX, y);
    y += 28;
  }

  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillStyle = MUTED;
  ctx.fillText(SITE_DOMAIN, centerX, rect.y + rect.h - pad - 18);
}

/** Cartaz A4 — grade 2×2: ícone+preço | título+descrição / QR | metadados */
export async function renderA4PosterCanvas(
  ad: AdData,
  qrCanvas: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = A4_POSTER_WIDTH;
  canvas.height = A4_POSTER_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = AMBER_100;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grid = layoutGrid(canvas.width, canvas.height);
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const title = ad.title.trim() || "Título do anúncio";
  const description = ad.desc.trim() || "Descrição do anúncio.";
  const typeLabel = TYPE_LABEL[ad.t].toUpperCase();
  const phoneDisplay = ad.phone ? formatPhoneNumber(ad.phone) : "";

  await drawIconPriceCell(ctx, grid.tl, ad, priceLabel);

  drawCell(ctx, grid.tr, WHITE);
  const descStartY = drawTitleBlock(ctx, grid.tr, typeLabel, title);
  drawDescriptionBlock(ctx, grid.tr, descStartY, description);

  drawQrCell(ctx, grid.bl, qrCanvas);
  drawMetaCell(ctx, grid.br, phoneDisplay, title);

  return canvas;
}

export async function renderA4PosterBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  const qrCanvas = await renderQrToCanvas(qrUrl, 512, AD_QR_FOREGROUND);
  const poster = await renderA4PosterCanvas(ad, qrCanvas);
  return new Promise((resolve, reject) => {
    poster.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar cartaz A4."))),
      "image/jpeg",
      0.92
    );
  });
}
