import type { AdData } from "../types/ad";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH } from "./constants";
import { isValidAdIcon } from "./adIcons";
import { isValidAdTheme } from "./adThemes";
import { sanitizePhone } from "./formatters";
import { sanitizeHttpUrl, sanitizePlainText } from "./sanitize";

/** Sanitiza todos os campos de texto vindos da URL ou do formulário */
export function sanitizeAdData(ad: AdData): AdData {
  const phoneRaw = sanitizePlainText(ad.phone ?? "", 32);
  const icon = ad.icon && isValidAdIcon(ad.icon) ? ad.icon : undefined;
  const theme = ad.theme && isValidAdTheme(ad.theme) ? ad.theme : undefined;
  return {
    ...ad,
    title: sanitizePlainText(ad.title, MAX_TITLE_LENGTH),
    price: sanitizePlainText(ad.price, 64),
    desc: sanitizePlainText(ad.desc, MAX_DESC_LENGTH),
    phone: phoneRaw ? sanitizePhone(phoneRaw) : "",
    pix: ad.pix ? sanitizePlainText(ad.pix, MAX_PIX_LENGTH) : undefined,
    cardLink: sanitizeHttpUrl(ad.cardLink),
    icon,
    theme,
    img: undefined,
  };
}
