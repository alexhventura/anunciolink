import type { AdData, AdType } from "../types/ad";
import { drawAdIconOnCanvas } from "./adIconCanvas";
import { isValidAdIconId, usesBrandMarkIcon } from "./adIcons";
import { drawCanvasBrandMarkCentered } from "./brandCanvas";
import { SITE_DOMAIN } from "./constants";
import { formatPhoneNumber } from "./formatters";
import { renderQrToCanvas } from "./qrCanvas";
import { AD_QR_FOREGROUND } from "./adThemes";

/** Card quadrado para redes */
export const CARD_EXPORT_SIZE = 1080;

/** A4 retrato @ 150 DPI — 210×297 mm */
export const A4_EXPORT_WIDTH = 1240;
export const A4_EXPORT_HEIGHT = 1754;

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
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

interface ExportLayout {
  tl: Rect;
  tr: Rect;
  bottom: Rect;
}

function scale(width: number, height: number): number {
  return Math.min(width, height);
}

function drawStrokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineWidth: number
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

function drawCell(ctx: CanvasRenderingContext2D, rect: Rect, fill: string, border: number) {
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  drawStrokeRect(ctx, rect.x, rect.y, rect.w, rect.h, border);
}

function layoutExportGrid(width: number, height: number): { layout: ExportLayout; border: number } {
  const s = scale(width, height);
  const margin = Math.round(s * 0.036);
  const gap = Math.round(s * 0.018);
  const border = Math.max(3, Math.round(s * 0.0035));
  const contentW = width - margin * 2;
  const contentH = height - margin * 2;
  const topH = Math.round(contentH * 0.56);
  const bottomH = contentH - topH - gap;
  const cellW = (contentW - gap) / 2;

  return {
    layout: {
      tl: { x: margin, y: margin, w: cellW, h: topH },
      tr: { x: margin + cellW + gap, y: margin, w: cellW, h: topH },
      bottom: { x: margin, y: margin + topH + gap, w: contentW, h: bottomH },
    },
    border,
  };
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  startY: number,
  lineHeight: number
) {
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += lineHeight;
  }
  return y;
}

function drawAdaptiveCenteredText(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  text: string,
  maxFont: number,
  minFont: number,
  weight = "600"
): number {
  const pad = rect.w * 0.08;
  const innerW = rect.w - pad * 2;
  const innerH = rect.h;
  const centerX = rect.x + rect.w / 2;

  for (let fontSize = maxFont; fontSize >= minFont; fontSize -= 1) {
    ctx.font = `${weight} ${fontSize}px system-ui, sans-serif`;
    const lineHeight = Math.round(fontSize * 1.32);
    const lines = wrapLines(ctx, text, innerW, 999);
    const blockH = lines.length * lineHeight;
    if (blockH <= innerH) {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const startY = rect.y + (rect.h - blockH) / 2;
      drawCenteredLines(ctx, lines, centerX, startY, lineHeight);
      return fontSize;
    }
  }

  ctx.font = `${weight} ${minFont}px system-ui, sans-serif`;
  const lineHeight = Math.round(minFont * 1.32);
  const maxLines = Math.max(1, Math.floor(innerH / lineHeight));
  const lines = wrapLines(ctx, text, innerW, maxLines);
  const clipped = text.trim().length > lines.join(" ").length;
  const display = clipped
    ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]?.replace(/\s+$/, "")}…`]
    : lines;
  const blockH = display.length * lineHeight;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  drawCenteredLines(ctx, display, centerX, rect.y + (rect.h - blockH) / 2, lineHeight);
  return minFont;
}

async function drawProductCell(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  ad: AdData,
  title: string,
  priceLabel: string,
  border: number,
  s: number
) {
  drawCell(ctx, rect, WHITE, border);

  const pad = Math.round(s * 0.04);
  const cx = rect.x + rect.w / 2;
  const innerW = rect.w - pad * 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;

  const titleMaxFont = Math.round(s * 0.048);
  let titleFont = titleMaxFont;
  let titleLines: string[] = [];
  for (let fs = titleMaxFont; fs >= Math.round(s * 0.028); fs -= 1) {
    ctx.font = `900 ${fs}px system-ui, sans-serif`;
    titleLines = wrapLines(ctx, title, innerW, 3);
    const titleH = titleLines.length * Math.round(fs * 1.2);
    if (titleH <= rect.h * 0.22) {
      titleFont = fs;
      break;
    }
  }

  ctx.font = `900 ${titleFont}px system-ui, sans-serif`;
  titleLines = wrapLines(ctx, title, innerW, 3);
  const titleLineH = Math.round(titleFont * 1.2);
  let y = rect.y + pad;
  drawCenteredLines(ctx, titleLines, cx, y, titleLineH);
  y += titleLines.length * titleLineH + pad * 0.5;

  const priceFont = Math.round(s * 0.052);
  const priceBlockH = priceFont * 1.4;
  const priceY = rect.y + rect.h - pad - priceBlockH;

  const iconAreaTop = y;
  const iconAreaBottom = priceY - pad;
  const iconCenterY = iconAreaTop + (iconAreaBottom - iconAreaTop) / 2;
  const iconSize = Math.min(innerW * 0.55, (iconAreaBottom - iconAreaTop) * 0.72);

  const useBrandMark = usesBrandMarkIcon(ad.icon);
  const iconId = useBrandMark || !isValidAdIconId(ad.icon) ? undefined : ad.icon;
  const iconBox = iconSize + Math.round(s * 0.03);
  const iconBoxX = cx - iconBox / 2;
  const iconBoxY = iconCenterY - iconBox / 2;

  ctx.fillStyle = WHITE;
  ctx.fillRect(iconBoxX, iconBoxY, iconBox, iconBox);
  drawStrokeRect(ctx, iconBoxX, iconBoxY, iconBox, iconBox, Math.max(3, border - 1));

  if (useBrandMark) {
    drawCanvasBrandMarkCentered(ctx, cx, iconCenterY + 2, iconSize);
  } else {
    await drawAdIconOnCanvas(ctx, iconId!, cx, iconCenterY + 2, iconSize, INK);
  }

  ctx.fillStyle = INK;
  ctx.font = `900 ${priceFont}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(priceLabel || "—", cx, priceY);
}

function drawDescriptionCell(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  typeLabel: string,
  description: string,
  border: number,
  s: number
) {
  drawCell(ctx, rect, WHITE, border);

  const pad = Math.round(s * 0.04);
  const cx = rect.x + rect.w / 2;

  ctx.font = `800 ${Math.round(s * 0.022)}px system-ui, sans-serif`;
  const chipW = ctx.measureText(typeLabel).width + Math.round(s * 0.04);
  const chipH = Math.round(s * 0.045);
  const chipX = cx - chipW / 2;
  const chipY = rect.y + pad;

  ctx.fillStyle = INK;
  ctx.fillRect(chipX, chipY, chipW, chipH);
  ctx.fillStyle = AMBER_500;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, cx, chipY + chipH / 2);

  const descRect: Rect = {
    x: rect.x + pad,
    y: chipY + chipH + pad * 0.75,
    w: rect.w - pad * 2,
    h: rect.y + rect.h - pad - (chipY + chipH + pad * 0.75),
  };

  ctx.fillStyle = INK;
  drawAdaptiveCenteredText(
    ctx,
    descRect,
    description,
    Math.round(s * 0.038),
    Math.round(s * 0.022),
    "600"
  );
}

function drawFooterCell(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  qrCanvas: HTMLCanvasElement,
  phoneDisplay: string,
  border: number,
  s: number
) {
  drawCell(ctx, rect, WHITE, border);

  const pad = Math.round(s * 0.04);
  const gap = Math.round(s * 0.03);
  const qrColW = Math.round(rect.w * 0.42);
  const textColW = rect.w - qrColW - gap - pad * 2;

  const qrArea: Rect = {
    x: rect.x + pad,
    y: rect.y + pad,
    w: qrColW,
    h: rect.h - pad * 2,
  };

  const textArea: Rect = {
    x: rect.x + pad + qrColW + gap,
    y: rect.y + pad,
    w: textColW,
    h: rect.h - pad * 2,
  };

  const maxQr = Math.min(qrArea.w, qrArea.h) * 0.92;
  const frameX = qrArea.x + (qrArea.w - maxQr) / 2;
  const frameY = qrArea.y + (qrArea.h - maxQr) / 2;

  ctx.fillStyle = WHITE;
  ctx.fillRect(frameX, frameY, maxQr, maxQr);
  drawStrokeRect(ctx, frameX, frameY, maxQr, maxQr, Math.max(3, border - 1));

  const innerPad = Math.round(maxQr * 0.08);
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

  const lines: Array<{ text: string; size: number; weight: string; color: string }> = [
    { text: "Escaneie o QR Code", size: Math.round(s * 0.042), weight: "900", color: INK },
    {
      text: "Aponte a câmera do celular para abrir o anúncio completo.",
      size: Math.round(s * 0.026),
      weight: "600",
      color: MUTED,
    },
  ];

  if (phoneDisplay) {
    lines.push({ text: phoneDisplay, size: Math.round(s * 0.044), weight: "900", color: INK });
  }

  lines.push({ text: SITE_DOMAIN, size: Math.round(s * 0.024), weight: "700", color: MUTED });

  const wrappedBlocks: Array<{ lines: string[]; lineH: number; size: number; weight: string; color: string }> =
    [];

  for (const block of lines) {
    ctx.font = `${block.weight} ${block.size}px system-ui, sans-serif`;
    const lineH = Math.round(block.size * 1.35);
    const wrapped = wrapLines(ctx, block.text, textArea.w, block.text === lines[1]?.text ? 4 : 2);
    wrappedBlocks.push({ lines: wrapped, lineH, size: block.size, weight: block.weight, color: block.color });
  }

  const blockGap = Math.round(s * 0.022);
  let totalH = 0;
  for (const block of wrappedBlocks) {
    totalH += block.lines.length * block.lineH;
  }
  totalH += blockGap * (wrappedBlocks.length - 1);

  let y = textArea.y + (textArea.h - totalH) / 2;
  const centerX = textArea.x + textArea.w / 2;

  for (let i = 0; i < wrappedBlocks.length; i++) {
    const block = wrappedBlocks[i]!;
    ctx.fillStyle = block.color;
    ctx.font = `${block.weight} ${block.size}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    y = drawCenteredLines(ctx, block.lines, centerX, y, block.lineH);
    if (i < wrappedBlocks.length - 1) y += blockGap;
  }
}

/** Layout unificado — card quadrado ou A4, mesma composição */
export async function renderAdExportCanvas(
  ad: AdData,
  qrCanvas: HTMLCanvasElement,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, width, height);

  const { layout, border } = layoutExportGrid(width, height);
  const s = scale(width, height);

  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const title = ad.title.trim() || "Título do anúncio";
  const description = ad.desc.trim() || "Descrição do anúncio.";
  const typeLabel = TYPE_LABEL[ad.t].toUpperCase();
  const phoneDisplay = ad.phone ? formatPhoneNumber(ad.phone) : "";

  await drawProductCell(ctx, layout.tl, ad, title, priceLabel, border, s);
  drawDescriptionCell(ctx, layout.tr, typeLabel, description, border, s);
  drawFooterCell(ctx, layout.bottom, qrCanvas, phoneDisplay, border, s);

  return canvas;
}

export async function renderCardExportCanvas(ad: AdData, qrCanvas: HTMLCanvasElement) {
  return renderAdExportCanvas(ad, qrCanvas, CARD_EXPORT_SIZE, CARD_EXPORT_SIZE);
}

export async function renderA4ExportCanvas(ad: AdData, qrCanvas: HTMLCanvasElement) {
  return renderAdExportCanvas(ad, qrCanvas, A4_EXPORT_WIDTH, A4_EXPORT_HEIGHT);
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem."))),
      "image/jpeg",
      0.92
    );
  });
}

export async function renderCardExportBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  const qrCanvas = await renderQrToCanvas(qrUrl, 512, AD_QR_FOREGROUND);
  const canvas = await renderCardExportCanvas(ad, qrCanvas);
  return canvasToJpegBlob(canvas);
}

export async function renderA4PosterBlob(ad: AdData, qrUrl: string): Promise<Blob> {
  const qrCanvas = await renderQrToCanvas(qrUrl, 640, AD_QR_FOREGROUND);
  const canvas = await renderA4ExportCanvas(ad, qrCanvas);
  return canvasToJpegBlob(canvas);
}
