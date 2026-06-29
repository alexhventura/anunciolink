/** Mensagem pré-formatada para compartilhar anúncio no WhatsApp (sem Open Graph server-side) */
export function buildWhatsAppShareMessage(title: string, price: string, adUrl: string): string {
  const safeTitle = title.trim() || "Produto";
  const safePrice = price.trim() || "R$ 0,00";

  return (
    `🛍️ Confira este anúncio no AnúncioLink: *${safeTitle}* por apenas *${safePrice}*. ` +
    `Veja todos os detalhes, fotos e faça o pagamento direto no link seguro: ${adUrl}`
  );
}

export function buildWhatsAppShareUrl(title: string, price: string, adUrl: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(
    buildWhatsAppShareMessage(title, price, adUrl)
  )}`;
}
