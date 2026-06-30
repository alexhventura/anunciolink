import { sanitizePlainText } from "./sanitize";

/** Garante prefixo único R$ para exibição na mensagem */
export function formatPriceForShare(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "R$ 0,00";
  if (/^R\$\s*/i.test(trimmed)) return trimmed;
  return `R$ ${trimmed}`;
}

/** Descrição curta para o card de texto do WhatsApp */
export function shortenDescriptionForShare(description: string, maxLen = 280): string {
  const cleaned = description.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Sem descrição adicional.";
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

/**
 * Card de texto para compartilhar no WhatsApp e apps compatíveis.
 * O visual completo fica na página do anúncio.
 */
export function buildWhatsAppShareMessage(
  title: string,
  price: string,
  description: string,
  adUrl: string
): string {
  const safeTitle = sanitizePlainText(title, 100) || "Produto";
  const safePrice = formatPriceForShare(sanitizePlainText(price, 32));
  const safeDesc = shortenDescriptionForShare(sanitizePlainText(description, 500));

  return (
    `🛍️ *${safeTitle}*\n` +
    `💰 ${safePrice}\n` +
    `📝 ${safeDesc}\n\n` +
    `🔗 Ver anúncio e pagar:\n` +
    `${adUrl}`
  );
}

export function buildWhatsAppShareUrl(
  title: string,
  price: string,
  description: string,
  adUrl: string
): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(
    buildWhatsAppShareMessage(title, price, description, adUrl)
  )}`;
}
