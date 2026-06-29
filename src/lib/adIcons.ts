import type { AdType } from "../types/ad";

export interface AdIconCategory {
  id: string;
  label: string;
  icons: string[];
}

/** Ícones curados para identificar produtos e serviços no card */
export const AD_ICON_CATEGORIES: AdIconCategory[] = [
  {
    id: "geral",
    label: "Geral",
    icons: ["📦", "🏷️", "⭐", "🔥", "✨", "💎", "🎁", "🛍️", "📢", "💡"],
  },
  {
    id: "eletronicos",
    label: "Eletrônicos",
    icons: ["📱", "💻", "🖥️", "⌚", "🎧", "📷", "🎮", "🖨️", "📺", "🔌"],
  },
  {
    id: "casa",
    label: "Casa",
    icons: ["🏠", "🛋️", "🪑", "🛏️", "🧺", "🪴", "💡", "🔧", "🚿", "🧹"],
  },
  {
    id: "moda",
    label: "Moda",
    icons: ["👕", "👗", "👟", "👜", "🧢", "💍", "👓", "🧥", "👠", "🎒"],
  },
  {
    id: "veiculos",
    label: "Veículos",
    icons: ["🚗", "🏍️", "🚲", "🛵", "🚐", "🛞", "⛽", "🛻", "🚙", "🛴"],
  },
  {
    id: "comida",
    label: "Comida",
    icons: ["🍔", "🍕", "🍰", "☕", "🍺", "🥗", "🍣", "🧁", "🥤", "🍫"],
  },
  {
    id: "servicos",
    label: "Serviços",
    icons: ["🛠️", "🔨", "✂️", "💇", "🧹", "🚚", "📋", "💼", "🎓", "🏋️"],
  },
  {
    id: "saude",
    label: "Saúde",
    icons: ["💊", "🏥", "🩺", "🦷", "🧘", "💆", "🩹", "🧴", "👶", "🐾"],
  },
  {
    id: "pets",
    label: "Pets",
    icons: ["🐶", "🐱", "🐦", "🐠", "🐹", "🐰", "🦴", "🐾", "🦜", "🐢"],
  },
  {
    id: "vaquinha",
    label: "Solidário",
    icons: ["❤️", "🤝", "🙏", "💚", "🌱", "🏥", "📚", "🍲", "🐕", "👨‍👩‍👧"],
  },
  {
    id: "lazer",
    label: "Lazer",
    icons: ["⚽", "🎸", "🎨", "📚", "🎬", "🏖️", "🎪", "🎯", "🎤", "🧩"],
  },
  {
    id: "natureza",
    label: "Natureza",
    icons: ["🌻", "🌳", "🍎", "🥑", "🌾", "🐄", "🌿", "🍇", "🌽", "🐝"],
  },
];

export const ALL_AD_ICONS = AD_ICON_CATEGORIES.flatMap((c) => c.icons);

export const DEFAULT_AD_ICON: Record<AdType, string> = {
  venda: "📦",
  servico: "🛠️",
  vaquinha: "❤️",
};

export function resolveAdIcon(icon: string | undefined, adType: AdType): string {
  if (icon && ALL_AD_ICONS.includes(icon)) return icon;
  return DEFAULT_AD_ICON[adType];
}

export function isValidAdIcon(value: string): boolean {
  return ALL_AD_ICONS.includes(value);
}
