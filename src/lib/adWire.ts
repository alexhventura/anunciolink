import type { AdData, AdType, BillingType, CropTransform } from "../types/ad";
import { computeExpiresAt } from "./adExpiry";
import { DEFAULT_CROP, isDefaultCrop } from "./imageCrop";
import { expandImageFromWire, stripImageForWire } from "./imageUtils";

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
  /** w:webp ou j:jpeg + base64 sem prefixo data: (legado) */
  i?: string;
  /** emoji do produto */
  e?: string;
  cz?: number;
  cx?: number;
  cy?: number;
  ts: number;
  ex?: number;
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
  if (ad.icon) wire.e = ad.icon;
  if (ad.img) wire.i = stripImageForWire(ad.img);
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
    icon: wire.e,
    img: wire.i ? expandImageFromWire(wire.i) : undefined,
    crop: decodeCrop(wire),
    timestamp: wire.ts,
    expiresAt: wire.ex ?? computeExpiresAt(wire.ts),
  };
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
    icon: typeof legacy.icon === "string" ? legacy.icon : undefined,
    crop: legacy.crop ?? DEFAULT_CROP,
    timestamp,
    expiresAt: expiresAt && Number.isFinite(expiresAt) ? expiresAt : computeExpiresAt(timestamp),
  };
}
