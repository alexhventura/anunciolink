import type { AdData } from "../types/ad";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH } from "./constants";
import { sanitizePhone } from "./formatters";
import { sanitizeHttpUrl, sanitizePlainText } from "./sanitize";

/** Sanitiza todos os campos de texto vindos da URL ou do formulário */
export function sanitizeAdData(ad: AdData): AdData {
  const phoneRaw = sanitizePlainText(ad.phone ?? "", 32);
  return {
    ...ad,
    title: sanitizePlainText(ad.title, MAX_TITLE_LENGTH),
    price: sanitizePlainText(ad.price, 64),
    desc: sanitizePlainText(ad.desc, MAX_DESC_LENGTH),
    phone: phoneRaw ? sanitizePhone(phoneRaw) : "",
    pix: ad.pix ? sanitizePlainText(ad.pix, MAX_PIX_LENGTH) : undefined,
    cardLink: sanitizeHttpUrl(ad.cardLink),
  };
}
