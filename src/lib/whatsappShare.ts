const DEFAULT_OG_IMAGE_PATH = "/og-default.jpg";

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
 * Card de texto para compartilhar no WhatsApp.
 * A foto fica apenas na URL — não entra no preview Open Graph.
 */
export function buildWhatsAppShareMessage(
  title: string,
  price: string,
  description: string,
  adUrl: string
): string {
  const safeTitle = title.trim() || "Produto";
  const safePrice = formatPriceForShare(price);
  const safeDesc = shortenDescriptionForShare(description);

  return (
    `🛍️ *NOVO ANÚNCIO NO ANÚNCIOLINK*\n\n` +
    `📦 *Produto:* ${safeTitle}\n` +
    `💰 *Preço:* ${safePrice}\n` +
    `📝 *Descrição:* ${safeDesc}\n\n` +
    `🔗 _Clique no link seguro para ver a foto do produto e negociar direto com o vendedor:_\n` +
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

export { DEFAULT_OG_IMAGE_PATH };
