import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QR_LOGO_SRC = "/qr-logo.svg";

/** Gera canvas PNG do QR Code com logo AnúncioLink */
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
  const logoSize = Math.round(size * 0.22);

  try {
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        level: "H",
        includeMargin: true,
        bgColor: "#ffffff",
        fgColor,
        marginSize: 2,
        imageSettings: {
          src: QR_LOGO_SRC,
          height: logoSize,
          width: logoSize,
          excavate: true,
          crossOrigin: "anonymous",
        },
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
    ctx.drawImage(source, 0, 0);
    return copy;
  } finally {
    root.unmount();
    container.remove();
  }
}
