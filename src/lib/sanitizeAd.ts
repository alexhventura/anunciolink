import type { AdData } from "../types/ad";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH } from "./constants";
import { isValidAdIcon } from "./adIcons";
import { normalizeExternalImageUrl } from "./externalImageUrl";
import { isEmbeddedImageData } from "./imageUtils";
import { sanitizePhone } from "./formatters";
import { sanitizeHttpUrl, sanitizePlainText } from "./sanitize";

function sanitizeAdImage(img: string | undefined): string | undefined {
  if (!img?.trim()) return undefined;
  const trimmed = img.trim();
  const external = normalizeExternalImageUrl(trimmed);
  if (external) return external;
  if (isEmbeddedImageData(trimmed)) return trimmed;
  return undefined;
}

/** Sanitiza todos os campos de texto vindos da URL ou do formulário */
export function sanitizeAdData(ad: AdData): AdData {
  const phoneRaw = sanitizePlainText(ad.phone ?? "", 32);
  const icon = ad.icon && isValidAdIcon(ad.icon) ? ad.icon : undefined;
  return {
    ...ad,
    title: sanitizePlainText(ad.title, MAX_TITLE_LENGTH),
    price: sanitizePlainText(ad.price, 64),
    desc: sanitizePlainText(ad.desc, MAX_DESC_LENGTH),
    phone: phoneRaw ? sanitizePhone(phoneRaw) : "",
    pix: ad.pix ? sanitizePlainText(ad.pix, MAX_PIX_LENGTH) : undefined,
    cardLink: sanitizeHttpUrl(ad.cardLink),
    icon,
    img: sanitizeAdImage(ad.img),
  };
}
