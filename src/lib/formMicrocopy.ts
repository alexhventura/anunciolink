import type { AdType } from "../types/ad";
import { adTypeRequiresPrice, adTypeShowsPayment } from "./adTypeUtils";

export const FORM_SECTION_COPY = {
  required: {
    title: "Essencial",
    subtitle: "Título e descrição bastam. Preço só nos tipos com valor.",
    badge: "Obrigatório",
  },
  optional: {
    title: "Extras",
    subtitle: "Ícone, WhatsApp, pagamento (se fizer sentido) e senha — tudo opcional.",
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
  if (adType === "contato") return "Ex.: Thor — se encontrar, ligue para o dono";
  return "Ex.: Aviso de mudança de horário / endereço";
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
  if (adType === "contato") {
    return "Nome do responsável, telefone, endereço aproximado, alergias ou recado importante… Ideal para QR na coleira, crachá ou cartão.";
  }
  return "Detalhe o aviso: o que muda, para quem é e até quando vale…";
}

export const FORM_SUBMIT_NOTICE =
  "Depois de pronto, a página não pode ser alterada no mesmo link. Se editar e gerar de novo, nasce um link novo — cada link funciona para sempre.";

export function fieldMicrocopy(adType: AdType) {
  const commercial = adTypeRequiresPrice(adType);
  return {
    title: commercial
      ? "Curto e direto — é o destaque do card."
      : "Nome ou título da página — aparece grande no QR.",
    price: "Só números; formatamos em Real automaticamente.",
    description: commercial
      ? "Quanto mais claro, mais rápido a pessoa decide."
      : "Explique o essencial: quem é, como contatar e o que fazer.",
    phone: commercial
      ? "Aparece na página para contato direto."
      : "WhatsApp do responsável — o mais importante em páginas de contato.",
    pix: "Quem abrir o link vê QR Pix e copia o código na hora.",
    cardLink: "Mercado Pago, Stripe, PagSeguro ou checkout similar.",
    password:
      "Deixe em branco para link público. Com senha, só quem souber desbloqueia — máx. 4 letras ou números.",
  } as const;
}

/** Compat: objeto estático usado onde o tipo ainda não importa */
export const FIELD_MICROCOPY = fieldMicrocopy("venda");
