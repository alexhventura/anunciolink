import type { AdType } from "../types/ad";

export const FORM_SECTION_COPY = {
  required: {
    title: "Essencial",
    subtitle: "Três campos e seu link já está pronto para compartilhar.",
    badge: "Obrigatório",
  },
  optional: {
    title: "Extras",
    subtitle: "Visual, Pix e cartão — deixe do jeito que você vende.",
    badge: "Opcional",
  },
  preview: {
    title: "Prévia ao vivo",
    subtitle: "Atualiza enquanto você preenche.",
  },
} as const;

export function titlePlaceholder(adType: AdType): string {
  if (adType === "venda") return "Ex.: iPhone 13 Pro Max 128GB";
  if (adType === "servico") return "Ex.: Personal Trainer — plano mensal";
  return "Ex.: Vaquinha para abrigo de animais";
}

export function priceLabel(adType: AdType): string {
  if (adType === "venda") return "Preço";
  if (adType === "servico") return "Valor do serviço";
  return "Meta ou valor sugerido";
}

export function descriptionPlaceholder(adType: AdType): string {
  if (adType === "venda") {
    return "Estado do produto, o que inclui, entrega ou retirada…";
  }
  if (adType === "servico") {
    return "O que está incluso, prazo, região e o que te diferencia…";
  }
  return "Objetivo da arrecadação, prazo e como o valor será usado…";
}

export const FIELD_MICROCOPY = {
  title: "Curto e direto — é o destaque do card do anúncio.",
  price: "Só números; formatamos em Real automaticamente.",
  description: "Quanto mais claro, mais rápido o comprador decide.",
  phone: "Aparece no anúncio para contato direto.",
  pix: "Quem abrir o link vê QR Pix e copia o código na hora.",
  cardLink: "Mercado Pago, Stripe, PagSeguro ou checkout similar.",
} as const;
