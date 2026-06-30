import type { AdData, AdType, AdThemeId, BillingType, CropTransform } from "../types/ad";
import { decodeIconFromWire, iconIdForWire } from "./adIcons";
import { isValidAdTheme } from "./adThemes";
import { computeExpiresAt } from "./adExpiry";
import { DEFAULT_CROP, isDefaultCrop } from "./imageCrop";
import { expandImageFromWire } from "./imageUtils";

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
  /** ID do ícone Lucide (0–119) ou -1 para marca do site */
  e?: number;
  /** tema visual */
  th?: string;
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
  const wireIcon = iconIdForWire(ad.icon, ad.t);
  if (wireIcon !== undefined) wire.e = wireIcon;
  /** Tema removido da UI — não codifica mais (decode legado preservado) */
  /** Encode de imagem/crop removido — decode legado preservado em fromCompactWire */
  if (ad.t === "venda" && ad.expiresAt) wire.ex = ad.expiresAt;
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
    icon: decodeIconFromWire(wire.e),
    theme: wire.th && isValidAdTheme(wire.th) ? (wire.th as AdThemeId) : undefined,
    img: wire.i ? expandImageFromWire(wire.i) : undefined,
    crop: decodeCrop(wire),
    timestamp: wire.ts,
    expiresAt:
      wire.t === "venda" ? (wire.ex ?? computeExpiresAt(wire.ts, "venda")) : undefined,
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
    icon:
      typeof legacy.icon === "number"
        ? decodeIconFromWire(legacy.icon)
        : decodeIconFromWire(legacy.icon as unknown),
    theme:
      typeof legacy.theme === "string" && isValidAdTheme(legacy.theme)
        ? legacy.theme
        : undefined,
    crop: legacy.crop ?? DEFAULT_CROP,
    timestamp,
    expiresAt:
      legacy.t === "venda"
        ? expiresAt && Number.isFinite(expiresAt)
          ? expiresAt
          : computeExpiresAt(timestamp, "venda")
        : undefined,
  };
}
