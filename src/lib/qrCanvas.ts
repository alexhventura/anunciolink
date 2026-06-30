import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getQrImageSettings, QR_CANVAS_MARGIN } from "./qrImageSettings";

/** Gera canvas PNG do QR Code com favicon AnúncioLink e margens mostarda */
export async function renderQrToCanvas(
  value: string,
  size: number,
  fgColor = "#18181b"
): Promise<HTMLCanvasElement> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        level: "H",
        fgColor,
        ...QR_CANVAS_MARGIN,
        imageSettings: getQrImageSettings(size),
      })
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const source = container.querySelector("canvas");
    if (!source) throw new Error("Falha ao gerar QR Code");

    const copy = document.createElement("canvas");
    copy.width = size;
    copy.height = size;
    const ctx = copy.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível");
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, size, size);
    return copy;
  } finally {
    root.unmount();
    container.remove();
  }
}

export { getQrImageSettings, getQrLogoSize, QR_CANVAS_MARGIN } from "./qrImageSettings";
