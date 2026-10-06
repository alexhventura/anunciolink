import type { AdType, BillingType } from "../types/ad";

/** Tipos disponíveis no formulário de criação */
export const AD_TYPE_OPTIONS: ReadonlyArray<{ id: AdType; label: string }> = [
  { id: "venda", label: "Venda" },
  { id: "servico", label: "Serviço" },
  { id: "vaquinha", label: "Vaquinha" },
  { id: "aviso", label: "Aviso" },
  { id: "contato", label: "Contato" },
] as const;

export const AD_TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
  aviso: "Aviso",
  contato: "Contato",
};

/** Tipos sem preço (página informativa / identificação) */
export function adTypeRequiresPrice(adType: AdType): boolean {
  return adType !== "aviso" && adType !== "contato";
}

/** Pix e link de cartão só fazem sentido em tipos comerciais */
export function adTypeShowsPayment(adType: AdType): boolean {
  return adTypeRequiresPrice(adType);
}

/** Texto exibido no lugar do preço (hero, card, export) */
export function formatAdPriceDisplay(
  adType: AdType,
  price: string,
  billingType: BillingType = "unico"
): string {
  const trimmed = price.trim();
  if (adType === "contato") return "Contato";
  if (!adTypeRequiresPrice(adType) || !trimmed) return "Sem valor";
  return trimmed + (billingType === "recorrente" ? " /mês" : "");
}

/** Prefill do WhatsApp conforme o tipo da página */
export function buildWhatsAppPrefill(adType: AdType, title: string): string {
  const safe = title.trim() || "esta página";
  if (adType === "contato") {
    return `Olá! Escaneei o QR de "${safe}" no AnúncioLink.`;
  }
  if (adType === "aviso") {
    return `Olá! Vi o aviso "${safe}" no AnúncioLink.`;
  }
  if (adType === "vaquinha") {
    return `Olá! Vi a vaquinha "${safe}" no AnúncioLink e gostaria de contribuir.`;
  }
  if (adType === "servico") {
    return `Olá! Vi seu serviço "${safe}" no AnúncioLink. Gostaria de saber mais.`;
  }
  return `Olá! Vi seu anúncio "${safe}" no AnúncioLink. Gostaria de combinar a compra.`;
}

export function landingActionsTitle(hasPayment: boolean, hasPhone: boolean): string {
  if (hasPayment && hasPhone) return "Pagamento e contato";
  if (hasPayment) return "Pagamento";
  return "Contato";
}

export function landingActionsLead(hasPayment: boolean, hasPhone: boolean): string {
  if (hasPayment && hasPhone) return "Pague agora ou fale direto com quem publicou.";
  if (hasPayment) return "Escolha como pagar abaixo.";
  if (hasPhone) return "Fale direto com quem publicou esta página.";
  return "Use os dados desta página para entrar em contato.";
}
