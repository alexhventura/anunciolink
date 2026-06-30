import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { AdProductIcon } from "../components/AdProductIcon";
import type { AdIconId } from "./adIcons";

/** Desenha ícone Lucide no canvas via SVG off-screen */
export async function drawAdIconOnCanvas(
  ctx: CanvasRenderingContext2D,
  iconId: AdIconId,
  cx: number,
  cy: number,
  size: number,
  color: string
): Promise<void> {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;pointer-events:none";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    createElement(AdProductIcon, {
      iconId,
      size,
      color,
      strokeWidth: 2.25,
    })
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const svg = container.querySelector("svg");
  if (!svg) {
    root.unmount();
    document.body.removeChild(container);
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Falha ao rasterizar ícone"));
    img.src = url;
  });

  ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  root.unmount();
  document.body.removeChild(container);
}
