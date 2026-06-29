export type AdType = "venda" | "servico" | "vaquinha";
export type BillingType = "unico" | "recorrente";
export type AdSenseSlot = "topo" | "meio" | "rodape";
export type AppView = "home" | "success" | "anuncio";

/** Vetores de enquadramento do mini-editor (viewport 280px) */
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
  img?: string;
  /** Enquadramento escolhido pelo vendedor — reaplicado via CSS na visualização */
  crop?: CropTransform;
  timestamp: number;
  /** Unix ms — pausa automática após 30 dias (gravado na URL) */
  expiresAt?: number;
  printMode?: boolean;
}

export interface ImageUploadError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "READ_FAILED" | "COMPRESS_FAILED";
  message: string;
}

export interface AdImagePayload {
  image?: string;
  crop?: CropTransform;
}
