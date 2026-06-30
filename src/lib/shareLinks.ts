import { sanitizePlainText } from "./sanitize";
import { formatPriceForShare, shortenDescriptionForShare } from "./whatsappShare";

export interface ShareContent {
  title: string;
  price: string;
  description: string;
  url: string;
}

/** Texto curto para Twitter/X e Telegram (limite ~240) */
export function buildShortShareText({ title, price, description, url }: ShareContent): string {
  const safeTitle = sanitizePlainText(title, 80) || "Anúncio";
  const safePrice = formatPriceForShare(sanitizePlainText(price, 32));
  const safeDesc = shortenDescriptionForShare(sanitizePlainText(description, 300), 120);
  return `${safeTitle} — ${safePrice}\n${safeDesc}\n${url}`;
}

/** Texto médio para Facebook e LinkedIn */
export function buildSocialShareText({ title, price, description, url }: ShareContent): string {
  const safeTitle = sanitizePlainText(title, 100) || "Anúncio";
  const safePrice = formatPriceForShare(sanitizePlainText(price, 32));
  const safeDesc = shortenDescriptionForShare(sanitizePlainText(description, 500), 200);
  return `${safeTitle} por ${safePrice}. ${safeDesc}\n\nVeja e pague: ${url}`;
}

export function buildFacebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}

export function buildLinkedInShareUrl(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function buildTelegramShareUrl(pageUrl: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`;
}

export function buildTwitterShareUrl(text: string, pageUrl: string): string {
  const tweet = `${text}\n${pageUrl}`.trim();
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
}

export { buildWhatsAppShareMessage, buildWhatsAppShareUrl } from "./whatsappShare";
