import { SITE_DOMAIN } from "./constants";

export const BRAND_FOOTER_LABEL = `Anunciado em: ${SITE_DOMAIN}`;

const INK = "#18181b";
const MUSTARD_SOFT = "#f59e0b";
const MUTED = "#71717a";
const WHITE = "#ffffff";
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

function strokeRoundRect(
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

/** Marca d'água centralizada — card social / export canvas */
export function drawCanvasBrandWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity = 0.07
) {
  const box = Math.min(width, height) * 0.38;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);
  ctx.rotate((-14 * Math.PI) / 180);
  strokeRoundRect(ctx, -box / 2, -box / 2, box, box, box * 0.18, WHITE);

  ctx.fillStyle = INK;
  ctx.font = `900 ${box * 0.48}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", 0, box * 0.02);

  ctx.beginPath();
  ctx.fillStyle = MUSTARD_SOFT;
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 2;
  const zx = box / 2 - box * 0.18;
  const zy = -box / 2 + box * 0.14;
  ctx.moveTo(zx, zy + box * 0.22);
  ctx.lineTo(zx - box * 0.06, zy);
  ctx.lineTo(zx + box * 0.04, zy + box * 0.09);
  ctx.lineTo(zx - box * 0.1, zy + box * 0.09);
  ctx.lineTo(zx, zy + box * 0.22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Rodapé padronizado — base do card exportado */
export function drawCanvasBrandFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  bottomPad: number,
  fontSize = 18
) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(BRAND_FOOTER_LABEL, width / 2, bottomPad);
  ctx.restore();
}

/** Ícone compacto centralizado — card social / hero */
export function drawCanvasBrandMarkCentered(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  const box = size;
  const x = cx - box / 2;
  const y = cy - box / 2;
  const r = box * 0.19;

  strokeRoundRect(ctx, x, y, box, box, r, "#fbbf24");
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, box * 0.04);
  roundRect(ctx, x, y, box, box, r);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `900 ${box * 0.46}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", cx, cy + box * 0.02);

  ctx.beginPath();
  ctx.fillStyle = MUSTARD_SOFT;
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, box * 0.035);
  const zx = x + box - box * 0.2;
  const zy = y + box * 0.12;
  ctx.moveTo(zx, zy + box * 0.22);
  ctx.lineTo(zx - box * 0.06, zy);
  ctx.lineTo(zx + box * 0.04, zy + box * 0.09);
  ctx.lineTo(zx - box * 0.1, zy + box * 0.09);
  ctx.lineTo(zx, zy + box * 0.22);
  ctx.fill();
  ctx.stroke();
}

/** Ícone compacto no canto — card social */
export function drawCanvasBrandMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const box = 52;
  strokeRoundRect(ctx, x, y, box, box, 10, WHITE);
  ctx.fillStyle = INK;
  ctx.font = "900 26px Inter, Arial, sans-serif";
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
