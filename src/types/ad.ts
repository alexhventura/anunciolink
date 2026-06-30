import type { AdIconId } from "../lib/adIcons";

export type AdType = "venda" | "servico" | "vaquinha";
export type BillingType = "unico" | "recorrente";
export type AdThemeId = "amber" | "midnight" | "sunset" | "purple" | "minimal";
export type AdSenseSlot = "topo" | "meio" | "rodape";
export type AppView =
  | "home"
  | "success"
  | "anuncio"
  | "como-funciona"
  | "sobre"
  | "privacidade"
  | "termos";

export interface CropTransform {
  zoom: number;
  panX: number;
  panY: number;
}

export interface AdData {
  t: AdType;
  title: string;
  price: string;
  billingType?: BillingType;
  desc: string;
  phone: string;
  pix?: string;
  cardLink?: string;
  /** ID compacto do ícone Lucide (catálogo adIcons) */
  icon?: AdIconId;
  /** Tema visual Bento */
  theme?: AdThemeId;
  /** Legado — ignorado em novos anúncios */
  img?: string;
  crop?: CropTransform;
  timestamp: number;
  expiresAt?: number;
}
