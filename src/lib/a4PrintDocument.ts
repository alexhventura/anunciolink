import type { AdData } from "../types/ad";
import { SITE_DOMAIN, SITE_NAME } from "./constants";
import { resolveAdIconId } from "./adIcons";
import { drawAdIconOnCanvas } from "./adIconCanvas";
import { formatPhoneNumber } from "./formatters";
import { renderQrToCanvas } from "./qrCanvas";

const TYPE_LABEL = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
} as const;

const BILLING_LABEL = {
  unico: "Pagamento único",
  recorrente: "Cobrança mensal",
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summarizeDescription(text: string, maxLen = 360): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}

function cardLinkLabel(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link de cartão";
  }
}

export async function renderIconToDataUrl(ad: AdData, size = 160): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  try {
    await drawAdIconOnCanvas(
      ctx,
      resolveAdIconId(ad.icon, ad.t),
      size / 2,
      size / 2,
      size * 0.52,
      "#18181b"
    );
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function buildPrintHtml(ad: AdData, qrDataUrl: string, iconDataUrl: string | null): string {
  const title = escapeHtml(ad.title.trim());
  const price = escapeHtml(ad.price.trim());
  const priceSuffix = ad.billingType === "recorrente" ? " <span class=\"price-suffix\">/mês</span>" : "";
  const desc = escapeHtml(summarizeDescription(ad.desc));
  const type = TYPE_LABEL[ad.t];
  const billing = BILLING_LABEL[ad.billingType ?? "unico"];
  const phone = ad.phone ? escapeHtml(formatPhoneNumber(ad.phone)) : "";
  const pix = ad.pix ? "Pix copia e cola no anúncio" : "";
  const card = ad.cardLink ? escapeHtml(cardLinkLabel(ad.cardLink)) : "";

  const iconBlock = iconDataUrl
    ? `<img src="${iconDataUrl}" alt="" class="icon-img" width="80" height="80" />`
    : `<div class="icon-placeholder" aria-hidden="true"></div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cartaz — ${title}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
      color: #18181b;
      background: #fffbeb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 190mm;
      min-height: 277mm;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 4mm;
    }
    .brand {
      flex-shrink: 0;
      padding: 3mm 5mm;
      border: 0.6mm solid #18181b;
      border-radius: 2mm;
      background: #18181b;
      color: #fbbf24;
      font-size: 9pt;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-align: center;
      text-transform: uppercase;
    }
    .card {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      border: 1mm solid #18181b;
      border-radius: 2.5mm;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 2.5mm 2.5mm 0 0 #18181b;
    }
    .hero {
      padding: 6mm 7mm 5mm;
      background: linear-gradient(155deg, #fbbf24 0%, #fde68a 45%, #fffbeb 100%);
      border-bottom: 0.8mm solid #18181b;
      text-align: center;
    }
    .icon-well {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22mm;
      height: 22mm;
      margin: 0 auto 3mm;
      border: 0.8mm solid #18181b;
      border-radius: 2mm;
      background: #ffffff;
      box-shadow: 1.5mm 1.5mm 0 0 #18181b;
    }
    .icon-img { display: block; width: 14mm; height: 14mm; object-fit: contain; }
    .icon-placeholder { width: 14mm; height: 14mm; }
    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm;
      justify-content: center;
      margin-bottom: 3mm;
    }
    .chip {
      display: inline-block;
      padding: 1mm 3.5mm;
      border: 0.45mm solid #18181b;
      background: #18181b;
      color: #fbbf24;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .chip--muted {
      background: #ffffff;
      color: #18181b;
    }
    .title {
      margin: 0 0 2mm;
      font-size: 20pt;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      word-wrap: break-word;
    }
    .price {
      margin: 0;
      font-size: 26pt;
      font-weight: 900;
      line-height: 1.05;
      font-variant-numeric: tabular-nums;
    }
    .price-suffix { font-size: 14pt; font-weight: 800; }
    .body {
      flex: 1 1 auto;
      padding: 5mm 7mm;
      background: #f59e0b;
      border-bottom: 0.8mm solid #18181b;
    }
    .desc-label {
      display: block;
      margin-bottom: 1.5mm;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(24, 24, 27, 0.65);
    }
    .desc {
      min-height: 22mm;
      margin: 0 0 4mm;
      font-size: 11pt;
      font-weight: 600;
      line-height: 1.45;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3mm;
    }
    .field {
      min-height: 16mm;
      padding: 2mm 2.5mm;
      border: 0.45mm dashed #18181b;
      border-radius: 1.5mm;
      background: rgba(255, 255, 255, 0.45);
    }
    .field-label {
      display: block;
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(24, 24, 27, 0.55);
    }
    .field-value {
      display: block;
      min-height: 8mm;
      margin-top: 1mm;
      font-size: 9pt;
      font-weight: 700;
      line-height: 1.3;
      word-break: break-word;
    }
    .qr-zone {
      flex-shrink: 0;
      padding: 5mm 6mm 4mm;
      border: 1mm solid #18181b;
      border-radius: 2.5mm;
      background: #ffffff;
      text-align: center;
      box-shadow: 2.5mm 2.5mm 0 0 #18181b;
    }
    .qr-title {
      margin: 0 0 4mm;
      font-size: 12pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .qr-frame {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 58mm;
      height: 58mm;
      padding: 2.5mm;
      border: 0.9mm solid #18181b;
      border-radius: 2mm;
      background: #ffffff;
      box-shadow: 1.5mm 1.5mm 0 0 #18181b;
    }
    .qr-img {
      display: block;
      width: 50mm;
      height: 50mm;
      object-fit: contain;
    }
    .qr-hint {
      margin: 4mm 0 0;
      font-size: 10pt;
      font-weight: 700;
    }
    .site-foot {
      flex-shrink: 0;
      padding-top: 1mm;
      font-size: 8.5pt;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="brand">${escapeHtml(SITE_NAME)}</div>

    <article class="card">
      <header class="hero">
        <div class="icon-well">${iconBlock}</div>
        <div class="chip-row">
          <span class="chip">${type}</span>
          <span class="chip chip--muted">${billing}</span>
        </div>
        <h1 class="title">${title || "&nbsp;"}</h1>
        <p class="price">${price || "&nbsp;"}${priceSuffix}</p>
      </header>

      <section class="body">
        <span class="desc-label">Descrição</span>
        <p class="desc">${desc || "&nbsp;"}</p>
        <div class="fields">
          <div class="field">
            <span class="field-label">WhatsApp</span>
            <span class="field-value">${phone || "&nbsp;"}</span>
          </div>
          <div class="field">
            <span class="field-label">Pix</span>
            <span class="field-value">${pix ? escapeHtml(pix) : "&nbsp;"}</span>
          </div>
          <div class="field">
            <span class="field-label">Cartão</span>
            <span class="field-value">${card || "&nbsp;"}</span>
          </div>
        </div>
      </section>
    </article>

    <section class="qr-zone">
      <h2 class="qr-title">Escaneie o QR Code</h2>
      <div class="qr-frame">
        <img src="${qrDataUrl}" alt="QR Code do anúncio" class="qr-img" width="512" height="512" />
      </div>
      <p class="qr-hint">Abra o anúncio completo no celular — ${escapeHtml(SITE_DOMAIN)}</p>
    </section>

    <p class="site-foot">${escapeHtml(SITE_DOMAIN)}</p>
  </div>
  <script>
    (function () {
      function runPrint() {
        var imgs = document.images;
        var pending = imgs.length;
        if (!pending) {
          window.focus();
          window.print();
          return;
        }
        function done() {
          pending -= 1;
          if (pending <= 0) {
            window.focus();
            window.print();
          }
        }
        for (var i = 0; i < imgs.length; i++) {
          if (imgs[i].complete) done();
          else {
            imgs[i].addEventListener("load", done);
            imgs[i].addEventListener("error", done);
          }
        }
      }
      if (document.readyState === "complete") runPrint();
      else window.addEventListener("load", runPrint);
    })();
  </script>
</body>
</html>`;
}

/** Abre janela isolada só com o cartaz — evita conflito com CSS de impressão da app */
export async function printA4PosterDocument(ad: AdData, qrUrl: string): Promise<void> {
  const [qrCanvas, iconDataUrl] = await Promise.all([
    renderQrToCanvas(qrUrl, 512),
    renderIconToDataUrl(ad, 160),
  ]);
  const qrDataUrl = qrCanvas.toDataURL("image/png");
  const html = buildPrintHtml(ad, qrDataUrl, iconDataUrl);

  const printWin = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!printWin) {
    throw new Error("Permita pop-ups para imprimir o cartaz A4.");
  }

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();

  printWin.addEventListener("afterprint", () => {
    printWin.close();
  });
}
