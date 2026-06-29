import type { AdThemeId } from "../types/ad";

export interface AdThemeDefinition {
  id: AdThemeId;
  label: string;
  /** Classe CSS do gradiente Bento */
  gradientClass: string;
  /** Cor dos módulos do QR Code */
  qrFg: string;
  /** Cor do texto principal no hero */
  textClass: string;
  /** Cor secundária (preço) */
  priceClass: string;
  chipClass: string;
}

export const AD_THEMES: AdThemeDefinition[] = [
  {
    id: "amber",
    label: "Amber Burst",
    gradientClass: "ad-theme-gradient--amber",
    qrFg: "#18181b",
    textClass: "text-zinc-900",
    priceClass: "text-zinc-900",
    chipClass: "!bg-black !text-amber-400",
  },
  {
    id: "midnight",
    label: "Midnight Black",
    gradientClass: "ad-theme-gradient--midnight",
    qrFg: "#0f172a",
    textClass: "text-white",
    priceClass: "text-amber-300",
    chipClass: "!bg-amber-400 !text-black",
  },
  {
    id: "sunset",
    label: "Sunset Orange",
    gradientClass: "ad-theme-gradient--sunset",
    qrFg: "#c2410c",
    textClass: "text-white",
    priceClass: "text-amber-100",
    chipClass: "!bg-white !text-orange-700",
  },
  {
    id: "purple",
    label: "Electric Purple",
    gradientClass: "ad-theme-gradient--purple",
    qrFg: "#6d28d9",
    textClass: "text-white",
    priceClass: "text-violet-100",
    chipClass: "!bg-fuchsia-300 !text-violet-950",
  },
  {
    id: "minimal",
    label: "Minimal Gray",
    gradientClass: "ad-theme-gradient--minimal",
    qrFg: "#52525b",
    textClass: "text-zinc-900",
    priceClass: "text-zinc-700",
    chipClass: "!bg-zinc-900 !text-white",
  },
];

export const DEFAULT_AD_THEME: AdThemeId = "amber";

const THEME_MAP = new Map(AD_THEMES.map((t) => [t.id, t]));

export const ALL_THEME_IDS = AD_THEMES.map((t) => t.id);

export function resolveAdTheme(theme: AdThemeId | undefined): AdThemeDefinition {
  if (theme && THEME_MAP.has(theme)) return THEME_MAP.get(theme)!;
  return THEME_MAP.get(DEFAULT_AD_THEME)!;
}

export function isValidAdTheme(value: string): value is AdThemeId {
  return ALL_THEME_IDS.includes(value as AdThemeId);
}
