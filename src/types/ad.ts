export type AdType = "venda" | "servico" | "vaquinha";
export type BillingType = "unico" | "recorrente";
export type AdSenseSlot = "topo" | "meio" | "rodape";
export type AppView = "home" | "success" | "anuncio";

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
  timestamp: number;
  printMode?: boolean;
}

export interface ImageUploadError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "READ_FAILED" | "COMPRESS_FAILED";
  message: string;
}
