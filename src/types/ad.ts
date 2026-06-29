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
  /** Áudio do vendedor — data URL webm/opus embutido na URL */
  audio?: string;
  crop?: CropTransform;
  timestamp: number;
  expiresAt?: number;
  printMode?: boolean;
}

export interface ImageUploadError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "READ_FAILED" | "COMPRESS_FAILED";
  message: string;
}

export interface AudioRecorderError {
  code: "PERMISSION_DENIED" | "NOT_SUPPORTED" | "TOO_LARGE" | "RECORD_FAILED";
  message: string;
}

export interface AdImagePayload {
  image?: string;
}
