import type { AdType, AdThemeId } from "../types/ad";
import { resolveAdIcon } from "./adIcons";
import { resolveAdTheme, type AdThemeDefinition } from "./adThemes";
import { formatPhoneNumber } from "./formatters";

const INK = "#18181b";
const AMBER_500 = "#f59e0b";
const WHITE = "#ffffff";

const TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

const THEME_GRADIENT: Record<AdThemeId, [string, string]> = {
  amber: ["#fbbf24", "#fffbeb"],
  midnight: ["#0f172a", "#334155"],
  sunset: ["#ea580c", "#fb923c"],
  purple: ["#7c3aed", "#c084fc"],
  minimal: ["#d4d4d8", "#fafafa"],
};

const THEME_HERO_TEXT: Record<AdThemeId, string> = {
  amber: INK,
  midnight: "#ffffff",
  sunset: "#ffffff",
  purple: "#ffffff",
  minimal: INK,
};

export interface PreviewCardCanvasInput {
  adType: AdType;
  title: string;
  price: string;
  description: string;
  icon?: string;
  theme?: AdThemeId;
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

function drawBentoHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: AdThemeDefinition,
  themeId: AdThemeId,
  emoji: string,
  title: string,
  priceLabel: string
) {
  const [c1, c2] = THEME_GRADIENT[themeId];
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, c1);
  gradient.addColorStop(1, c2);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);

  ctx.font = `${Math.round(w * 0.2)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + w / 2, y + h * 0.38);

  const textColor = THEME_HERO_TEXT[themeId];
  ctx.fillStyle = textColor;
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.textBaseline = "top";
  wrapParagraph(ctx, title || "Título", x + 24, y + h * 0.58, w - 48, 34, 2);

  ctx.font = "900 26px system-ui, sans-serif";
  ctx.fillText(priceLabel || "—", x + 24, y + h - 56);
}

/** Renderiza card Bento idêntico ao AdPreviewCard em canvas */
export async function renderPreviewCardCanvas(input: PreviewCardCanvasInput): Promise<HTMLCanvasElement> {
  const canvasW = input.width ?? 1080;
  const pad = 48;
  const cardW = canvasW - pad * 2;
  const innerPad = 36;
  const contentW = cardW - innerPad * 2;

  const themeId = input.theme ?? "amber";
  const themeDef = resolveAdTheme(themeId);
  const emoji = resolveAdIcon(input.icon, input.adType);
  const priceLabel = input.price + (input.billingRecorrente ? " /mês" : "");
  const typeLabel = TYPE_LABEL[input.adType].toUpperCase();
  const phoneDisplay = input.phone ? formatPhoneNumber(input.phone) : "";

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  mctx.font = "500 17px system-ui, sans-serif";
  const descLineCount = Math.min(
    14,
    Math.max(2, Math.ceil((input.description || "").length / Math.max(1, Math.floor(contentW / 9))))
  );

  const heroH = 320;
  const chipH = 34;
  const descH = descLineCount * 24 + 16;
  const bodyH = innerPad + chipH + 14 + descH + innerPad;
  const footerH = input.qrCanvas ? (phoneDisplay ? 220 : 190) : phoneDisplay ? 56 : 0;
  const canvasH = pad + heroH + bodyH + footerH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 0, canvasW, canvasH);

  let y = pad;
  const cardX = pad;
  const cardH = heroH + bodyH + footerH;

  ctx.fillStyle = WHITE;
  ctx.shadowColor = INK;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.fillRect(cardX, y, cardW, cardH);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX, y, cardW, cardH);

  drawBentoHero(ctx, cardX, y, cardW, heroH, themeDef, themeId, emoji, input.title, priceLabel);

  y += heroH;
  ctx.fillStyle = AMBER_500;
  ctx.fillRect(cardX + 3, y, cardW - 6, bodyH - 3);

  let cy = y + innerPad;
  const cx = cardX + innerPad;

  ctx.fillStyle = INK;
  ctx.font = "800 13px system-ui, sans-serif";
  const chipW = ctx.measureText(typeLabel).width + 28;
  ctx.fillRect(cx, cy, chipW, chipH);
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeLabel, cx + chipW / 2, cy + chipH / 2);

  cy += chipH + 14;
  ctx.font = "500 17px system-ui, sans-serif";
  ctx.fillStyle = "rgba(24,24,27,0.85)";
  ctx.textAlign = "left";
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
