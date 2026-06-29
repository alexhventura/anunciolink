import type { AdData, AdType, BillingType, CropTransform } from "../types/ad";
import { computeExpiresAt } from "./adExpiry";
import { DEFAULT_CROP, isDefaultCrop } from "./imageCrop";

/** Payload compacto na URL — chaves mínimas para reduzir bytes antes do deflate */
export interface CompactAdWire {
  t: AdType;
  ti: string;
  p: string;
  d: string;
  b?: BillingType;
  ph?: string;
  x?: string;
  c?: string;
  /** w:webp ou j:jpeg + base64 sem prefixo data: */
  i?: string;
  /** o:opus/webm base64 sem prefixo data: */
  a?: string;
  /** Cupom: código + desconto % */
  cc?: string;
  dv?: number;
  cz?: number;
  cx?: number;
  cy?: number;
  ts: number;
  ex?: number;
  pm?: boolean;
}

function encodeCrop(crop: CropTransform): Pick<CompactAdWire, "cz" | "cx" | "cy"> | undefined {
  if (isDefaultCrop(crop)) return undefined;
  return {
    cz: Math.round(crop.zoom * 100),
    cx: Math.round(crop.panX * 10),
    cy: Math.round(crop.panY * 10),
  };
}

function decodeCrop(wire: CompactAdWire): CropTransform | undefined {
  if (wire.cz === undefined) return undefined;
  return {
    zoom: wire.cz / 100,
    panX: (wire.cx ?? 0) / 10,
    panY: (wire.cy ?? 0) / 10,
  };
}

export function toCompactWire(ad: AdData): CompactAdWire {
  const wire: CompactAdWire = {
    t: ad.t,
    ti: ad.title,
    p: ad.price,
    d: ad.desc,
    ts: ad.timestamp,
  };
  if (ad.billingType && ad.billingType !== "unico") wire.b = ad.billingType;
  if (ad.phone) wire.ph = ad.phone;
  if (ad.pix) wire.x = ad.pix;
  if (ad.cardLink) wire.c = ad.cardLink;
  if (ad.printMode) wire.pm = true;
  if (ad.img) wire.i = stripImageDataUrl(ad.img);
  if (ad.audio) wire.a = stripAudioDataUrl(ad.audio);
  if (ad.couponCode && ad.couponPercent) {
    wire.cc = ad.couponCode;
    wire.dv = ad.couponPercent;
  }
  const cropFields = ad.crop ? encodeCrop(ad.crop) : undefined;
  if (cropFields) Object.assign(wire, cropFields);
  if (ad.expiresAt) wire.ex = ad.expiresAt;
  return wire;
}

export function fromCompactWire(wire: CompactAdWire): AdData {
  return {
    t: wire.t,
    title: wire.ti,
    price: wire.p,
    desc: wire.d,
    billingType: wire.b ?? "unico",
    phone: wire.ph ?? "",
    pix: wire.x,
    cardLink: wire.c,
    img: wire.i ? expandImageDataUrl(wire.i) : undefined,
    audio: wire.a ? expandAudioDataUrl(wire.a) : undefined,
    couponCode: wire.cc,
    couponPercent: wire.dv,
    crop: decodeCrop(wire),
    timestamp: wire.ts,
    expiresAt: wire.ex ?? computeExpiresAt(wire.ts),
    printMode: wire.pm,
  };
}

function stripImageDataUrl(dataUrl: string): string {
  const webpMatch = dataUrl.match(/^data:image\/webp;base64,(.+)$/);
  if (webpMatch) return `w:${webpMatch[1]}`;
  const jpegMatch = dataUrl.match(/^data:image\/(?:jpeg|jpg);base64,(.+)$/);
  if (jpegMatch) return `j:${jpegMatch[1]}`;
  if (dataUrl.startsWith("w:") || dataUrl.startsWith("j:")) return dataUrl;
  return `j:${dataUrl}`;
}

function expandImageDataUrl(compact: string): string {
  if (compact.startsWith("w:")) return `data:image/webp;base64,${compact.slice(2)}`;
  if (compact.startsWith("j:")) return `data:image/jpeg;base64,${compact.slice(2)}`;
  return `data:image/jpeg;base64,${compact}`;
}

function stripAudioDataUrl(dataUrl: string): string {
  const webmMatch = dataUrl.match(/^data:audio\/webm(?:;[^,]*)?;base64,(.+)$/);
  if (webmMatch) return `o:${webmMatch[1]}`;
  const oggMatch = dataUrl.match(/^data:audio\/ogg(?:;[^,]*)?;base64,(.+)$/);
  if (oggMatch) return `g:${oggMatch[1]}`;
  const mp4Match = dataUrl.match(/^data:audio\/(?:mp4|mpeg);(?:[^,]*)?;base64,(.+)$/);
  if (mp4Match) return `m:${mp4Match[1]}`;
  if (dataUrl.startsWith("o:") || dataUrl.startsWith("g:") || dataUrl.startsWith("m:")) {
    return dataUrl;
  }
  return `o:${dataUrl}`;
}

function expandAudioDataUrl(compact: string): string {
  if (compact.startsWith("o:")) return `data:audio/webm;base64,${compact.slice(2)}`;
  if (compact.startsWith("g:")) return `data:audio/ogg;base64,${compact.slice(2)}`;
  if (compact.startsWith("m:")) return `data:audio/mp4;base64,${compact.slice(2)}`;
  return `data:audio/webm;base64,${compact}`;
}

/** Converte AdData legado (JSON completo) para wire compacto */
export function normalizeLegacyAd(parsed: Record<string, unknown>): AdData | null {
  if (typeof parsed.ti === "string" && typeof parsed.t === "string") {
    return fromCompactWire(parsed as unknown as CompactAdWire);
  }
  const legacy = parsed as Partial<
    AdData & { title?: string; desc?: string; expiresAt?: number | string }
  >;
  if (!legacy.t || !legacy.title || !legacy.price || !legacy.desc) return null;

  const expiresAt =
    typeof legacy.expiresAt === "number"
      ? legacy.expiresAt
      : typeof legacy.expiresAt === "string"
        ? Date.parse(legacy.expiresAt)
        : undefined;

  const timestamp = legacy.timestamp ?? Date.now();

  return {
    t: legacy.t,
    title: legacy.title,
    price: legacy.price,
    billingType: legacy.billingType ?? "unico",
    desc: legacy.desc,
    phone: legacy.phone ?? "",
    pix: legacy.pix,
    cardLink: legacy.cardLink,
    img: legacy.img,
    audio: legacy.audio,
    couponCode: legacy.couponCode,
    couponPercent: legacy.couponPercent,
    crop: legacy.crop ?? DEFAULT_CROP,
    timestamp,
    expiresAt: expiresAt && Number.isFinite(expiresAt) ? expiresAt : computeExpiresAt(timestamp),
    printMode: legacy.printMode,
  };
}
