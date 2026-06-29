import type { AdData } from "../types/ad";
import { SITE_NAME, SITE_URL } from "./constants";
import { getAdCanonicalUrl } from "./adRoutes";
import { parsePriceToNumber } from "./formatters";
import { DEFAULT_OG_IMAGE_PATH } from "./whatsappShare";

const DEFAULT_OG_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;

const DEFAULT_TITLE = `${SITE_NAME} — Crie seu anúncio em segundos`;
const DEFAULT_DESCRIPTION =
  "Plataforma de desapego ultra-rápida. Crie anúncio com foto, Pix e link compartilhável. Sem cadastro, sem taxas.";

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

export function removeAdJsonLd() {
  document.getElementById("ad-jsonld")?.remove();
}

export function injectProductJsonLd(ad: AdData, canonicalUrl: string) {
  removeAdJsonLd();

  const priceValue = parsePriceToNumber(ad.price);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ad.title,
    description: ad.desc,
    image: DEFAULT_OG_IMAGE,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: priceValue ?? ad.price,
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
  const pageTitle = `${ad.title} — ${ad.price} | ${SITE_NAME}`;
  const pageDescription = `${ad.title} por ${ad.price}. ${ad.desc.slice(0, 140)}${ad.desc.length > 140 ? "…" : ""}`;

  document.title = pageTitle;
  upsertMeta("description", pageDescription);
  upsertMeta("og:title", pageTitle, "property");
  upsertMeta("og:description", pageDescription, "property");
  upsertMeta("og:type", "product", "property");
  upsertMeta("og:url", canonicalUrl, "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  upsertMeta("twitter:card", "summary");
  upsertMeta("twitter:title", pageTitle);
  upsertMeta("twitter:description", pageDescription);
  upsertMeta("og:image", DEFAULT_OG_IMAGE, "property");
  upsertMeta("twitter:image", DEFAULT_OG_IMAGE);

  upsertLink("canonical", canonicalUrl);
  injectProductJsonLd(ad, canonicalUrl);
}

export function applyHomeDocumentMeta() {
  document.title = DEFAULT_TITLE;
  upsertMeta("description", DEFAULT_DESCRIPTION);
  upsertMeta("og:title", DEFAULT_TITLE, "property");
  upsertMeta("og:description", DEFAULT_DESCRIPTION, "property");
  upsertMeta("og:type", "website", "property");
  upsertMeta("og:url", SITE_URL, "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  upsertLink("canonical", SITE_URL);
  removeAdJsonLd();
}
