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
  /** Emoji do produto/serviço */
  icon?: string;
  /** Tema visual Bento */
  theme?: AdThemeId;
  /** Legado — ignorado em novos anúncios */
  img?: string;
  crop?: CropTransform;
  timestamp: number;
  expiresAt?: number;
}

export interface ImageUploadError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "READ_FAILED" | "COMPRESS_FAILED";
  message: string;
}
