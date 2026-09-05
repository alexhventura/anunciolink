import type { AdType } from "../types/ad";

export const FORM_SECTION_COPY = {
  required: {
    title: "Essencial",
    subtitle: "Título e descrição bastam; preço só quando o tipo tiver valor.",
    badge: "Obrigatório",
  },
  optional: {
    title: "Extras",
    subtitle: "Visual, contato, pagamento e senha — opcional conforme o tipo.",
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
  if (adType === "vaquinha") return "Ex.: Vaquinha para abrigo de animais";
  return "Ex.: Aviso de mudança de endereço / horário";
}

export function priceLabel(adType: AdType): string {
  if (adType === "venda") return "Preço";
  if (adType === "servico") return "Valor do serviço";
  if (adType === "vaquinha") return "Meta ou valor sugerido";
  return "Valor (não se aplica)";
}

export function descriptionPlaceholder(adType: AdType): string {
  if (adType === "venda") {
    return "Estado do produto, o que inclui, entrega ou retirada…";
  }
  if (adType === "servico") {
    return "O que está incluso, prazo, região e o que te diferencia…";
  }
  if (adType === "vaquinha") {
    return "Objetivo da arrecadação, prazo e como o valor será usado…";
  }
  return "Detalhe o aviso ou informativo: o que muda, para quem é e até quando vale…";
}

export const FORM_SUBMIT_NOTICE =
  "Depois de pronto, o anúncio não pode ser alterado no mesmo link. Se você editar e gerar de novo, será criado um link novo — cada link gerado funciona para sempre.";

export const FIELD_MICROCOPY = {
  title: "Curto e direto — é o destaque do card do anúncio.",
  price: "Só números; formatamos em Real automaticamente.",
  description: "Quanto mais claro, mais rápido o comprador decide.",
  phone: "Aparece no anúncio para contato direto.",
  pix: "Quem abrir o link vê QR Pix e copia o código na hora.",
  cardLink: "Mercado Pago, Stripe, PagSeguro ou checkout similar.",
  password:
    "Deixe em branco para link público. Com senha, só quem souber desbloqueia — máx. 4 letras ou números.",
} as const;
