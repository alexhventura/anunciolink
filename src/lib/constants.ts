export const SITE_NAME = "Anuncio Link";
export const SITE_DOMAIN = "www.anunciolink.com.br";
export const SITE_URL = `https://${SITE_DOMAIN}`;

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESC_LENGTH = 1000;
export const MAX_PIX_LENGTH = 500;

/** Limite absoluto da URL compartilhável (WhatsApp / mobile) */
export const MAX_SHARE_URL_LENGTH = 2048;
/** Margem de segurança antes de truncar texto */
export const MAX_SHARE_URL_SAFE = 2000;

export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID ?? "";
export const ADSENSE_SLOTS: Record<
  import("../types/ad").AdSenseSlot,
  { slotId: string; minHeight: number; label: string }
> = {
  topo: { slotId: import.meta.env.VITE_ADSENSE_SLOT_TOP ?? "", minHeight: 90, label: "728×90" },
  meio: { slotId: import.meta.env.VITE_ADSENSE_SLOT_MID ?? "", minHeight: 280, label: "336×280" },
  rodape: { slotId: import.meta.env.VITE_ADSENSE_SLOT_FOOT ?? "", minHeight: 250, label: "970×250" },
};
