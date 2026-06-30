import type { AdData, AdType } from "../types/ad";
import type { InstitutionalView } from "./siteRoutes";
import { SITE_NAME, SITE_URL } from "./constants";
import { parsePriceToNumber } from "./formatters";
import { sanitizePlainText } from "./sanitize";

/** Limites recomendados para Lighthouse / SERP */
export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MAX = 155;

export const SEO_SITE = {
  name: SITE_NAME,
  url: SITE_URL,
  locale: "pt-BR",
  language: "pt-BR",
  logoUrl: `${SITE_URL}/favicon.svg`,
  ogImage: `${SITE_URL}/og-default.jpg`,
} as const;

const AD_TYPE_LABEL: Record<AdType, string> = {
  venda: "Produto à venda",
  servico: "Serviço",
  vaquinha: "Vaquinha solidária",
};

function truncateAtWord(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  if (maxLen <= 1) return "…";
  const slice = trimmed.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return `${slice.slice(0, lastSpace).trimEnd()}…`;
  return `${slice.trimEnd()}…`;
}

export function buildSeoTitle(base: string, suffix = ` | ${SITE_NAME}`): string {
  const safe = sanitizePlainText(base, 120);
  const maxBase = Math.max(20, SEO_TITLE_MAX - suffix.length);
  return `${truncateAtWord(safe, maxBase)}${suffix}`;
}

export function buildSeoDescription(text: string, maxLen = SEO_DESC_MAX): string {
  return truncateAtWord(sanitizePlainText(text, maxLen + 40), maxLen);
}

export interface PageSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: "index, follow, max-image-preview:large" | "noindex, nofollow";
  ogType: "website" | "product";
  imageAlt: string;
  priceAmount?: string;
  priceCurrency?: string;
}

export const HOME_SEO: Omit<PageSeoMeta, "canonicalUrl"> = {
  title: buildSeoTitle("Landing page grátis com Pix e QR Code"),
  description: buildSeoDescription(
    "Crie landing page com ícone, tema visual, Pix e QR Code. Link compartilhável no WhatsApp. Sem cadastro, sem taxas, 100% no navegador."
  ),
  robots: "index, follow, max-image-preview:large",
  ogType: "website",
  imageAlt: `${SITE_NAME} — landing page grátis com Pix e QR Code`,
};

export const INSTITUTIONAL_SEO: Record<
  InstitutionalView,
  { title: string; description: string; breadcrumb: string }
> = {
  "como-funciona": {
    title: buildSeoTitle("Como funciona"),
    description: buildSeoDescription(
      "Passo a passo para criar landing page com ícone, tema, Pix e QR Code. Compartilhe o link no WhatsApp. Sem cadastro e custo zero."
    ),
    breadcrumb: "Como funciona",
  },
  sobre: {
    title: buildSeoTitle("Sobre o Anuncio Link"),
    description: buildSeoDescription(
      "Conheça o Anuncio Link: comércio digital direto com landing page instantânea, dados na URL e zero banco de dados."
    ),
    breadcrumb: "Sobre",
  },
  privacidade: {
    title: buildSeoTitle("Privacidade e cookies"),
    description: buildSeoDescription(
      "Política de privacidade do Anuncio Link. Não armazenamos anúncios em servidores — tudo viaja codificado na URL que você compartilha."
    ),
    breadcrumb: "Privacidade",
  },
  termos: {
    title: buildSeoTitle("Termos de uso"),
    description: buildSeoDescription(
      "Termos de uso do Anuncio Link. Ferramenta gratuita de anúncios. Responsabilidade do vendedor e expiração padrão em 30 dias."
    ),
    breadcrumb: "Termos",
  },
};

export function buildAdPageSeo(ad: AdData, canonicalUrl: string): PageSeoMeta {
  const safeTitle = sanitizePlainText(ad.title, 100);
  const safePrice = sanitizePlainText(ad.price, 32);
  const safeDesc = sanitizePlainText(ad.desc, 400);
  const priceValue = parsePriceToNumber(ad.price);
  const category = AD_TYPE_LABEL[ad.t];

  const titleSuffix = ` | ${SITE_NAME}`;
  const pricePart = ` — ${safePrice}`;
  const maxTitleLen = SEO_TITLE_MAX - titleSuffix.length - pricePart.length;
  const shortTitle = truncateAtWord(safeTitle, Math.max(16, maxTitleLen));

  const description = buildSeoDescription(
    `${category}: ${safeTitle} por ${safePrice}. ${safeDesc}`
  );

  return {
    title: `${shortTitle}${pricePart}${titleSuffix}`,
    description,
    canonicalUrl,
    robots: "index, follow, max-image-preview:large",
    ogType: "product",
    imageAlt: `${safeTitle} — ${safePrice} no ${SITE_NAME}`,
    priceAmount: priceValue !== undefined ? priceValue.toFixed(2) : undefined,
    priceCurrency: "BRL",
  };
}
