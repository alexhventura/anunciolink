import type { AdData, AppView } from "../types/ad";
import { getPathForInstitutionalView, isInstitutionalView } from "./siteRoutes";
import { SITE_NAME, SITE_URL } from "./constants";
import { getAdCanonicalUrl } from "./adRoutes";
import { parsePriceToNumber } from "./formatters";
import { DEFAULT_OG_IMAGE_PATH } from "./whatsappShare";
import { sanitizePlainText } from "./sanitize";

const DEFAULT_OG_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;

const DEFAULT_TITLE = `${SITE_NAME} — Crie seu anúncio em segundos`;
const DEFAULT_DESCRIPTION =
  "Plataforma de desapego ultra-rápida. Crie anúncio com foto, Pix e link compartilhável. Sem cadastro, sem taxas, custo zero.";

function upsertMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function applyCommonSocialMeta(title: string, description: string, url: string, type: string) {
  document.title = title;
  upsertMeta("description", description);
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:type", type, "property");
  upsertMeta("og:url", url, "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  upsertMeta("og:locale", "pt_BR", "property");
  upsertMeta("og:image", DEFAULT_OG_IMAGE, "property");
  upsertMeta("og:image:width", "1200", "property");
  upsertMeta("og:image:height", "630", "property");
  upsertMeta("og:image:type", "image/jpeg", "property");
  upsertMeta("og:image:alt", `${SITE_NAME} — anúncio com foto, Pix e WhatsApp`, "property");
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", title);
  upsertMeta("twitter:description", description);
  upsertMeta("twitter:image", DEFAULT_OG_IMAGE);
  upsertLink("canonical", url);
}

export function removeAdJsonLd() {
  document.getElementById("ad-jsonld")?.remove();
  document.getElementById("site-jsonld")?.remove();
}

function injectWebsiteJsonLd() {
  removeAdJsonLd();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "pt-BR",
  };
  const script = document.createElement("script");
  script.id = "site-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export function injectProductJsonLd(ad: AdData, canonicalUrl: string) {
  removeAdJsonLd();

  const priceValue = parsePriceToNumber(ad.price);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sanitizePlainText(ad.title, 120),
    description: sanitizePlainText(ad.desc, 300),
    image: DEFAULT_OG_IMAGE,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: priceValue ?? sanitizePlainText(ad.price, 32),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
  };

  const script = document.createElement("script");
  script.id = "ad-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/** Injeta meta tags de forma síncrona — chamado no bootstrap antes do React (Googlebot) */
export function applyAdDocumentMeta(ad: AdData) {
  const canonicalUrl = getAdCanonicalUrl();
  const safeTitle = sanitizePlainText(ad.title, 100);
  const safeDesc = sanitizePlainText(ad.desc, 140);
  const safePrice = sanitizePlainText(ad.price, 32);
  const pageTitle = `${safeTitle} — ${safePrice} | ${SITE_NAME}`;
  const pageDescription = `${safeTitle} por ${safePrice}. ${safeDesc}${ad.desc.length > 140 ? "…" : ""}`;

  applyCommonSocialMeta(pageTitle, pageDescription, canonicalUrl, "product");
  injectProductJsonLd(ad, canonicalUrl);
}

export function applyHomeDocumentMeta() {
  applyCommonSocialMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_URL, "website");
  injectWebsiteJsonLd();
}

const INSTITUTIONAL_META: Record<
  Extract<AppView, "como-funciona" | "sobre" | "privacidade" | "termos">,
  { title: string; description: string }
> = {
  "como-funciona": {
    title: `Como Funciona — ${SITE_NAME}`,
    description:
      "Passo a passo para criar anúncios com foto, Pix e link compartilhável no WhatsApp. Sem cadastro, sem banco de dados e custo zero.",
  },
  sobre: {
    title: `Sobre — ${SITE_NAME}`,
    description:
      "Conheça a missão do Anuncio Link: democratizar o comércio digital direto com simplicidade, agilidade e tecnologia 100% no navegador.",
  },
  privacidade: {
    title: `Privacidade e Cookies — ${SITE_NAME}`,
    description:
      "O Anuncio Link não armazena fotos, preços ou dados pessoais em servidores. Tudo viaja codificado na URL gerada.",
  },
  termos: {
    title: `Termos de Uso — ${SITE_NAME}`,
    description:
      "Ferramenta gratuita de facilitação de anúncios. Responsabilidade do vendedor e expiração automática em 30 dias.",
  },
};

export function applyInstitutionalDocumentMeta(
  view: Extract<AppView, "como-funciona" | "sobre" | "privacidade" | "termos">
) {
  const meta = INSTITUTIONAL_META[view];
  const pageUrl = `${SITE_URL}${getPathForInstitutionalView(view)}`;
  applyCommonSocialMeta(meta.title, meta.description, pageUrl, "website");
  injectWebsiteJsonLd();
}

export function applyDocumentMetaForView(view: AppView, ad: AdData | null) {
  if (view === "anuncio" && ad) {
    applyAdDocumentMeta(ad);
  } else if (isInstitutionalView(view)) {
    applyInstitutionalDocumentMeta(view);
  } else {
    applyHomeDocumentMeta();
  }
}
