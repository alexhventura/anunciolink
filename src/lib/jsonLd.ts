import type { AdData, AdType } from "../types/ad";
import type { InstitutionalView } from "./siteRoutes";
import { resolveAdExpiresAt } from "./adExpiry";
import { SEO_SITE } from "./seoMeta";
import { sanitizePlainText } from "./sanitize";

const ORG_ID = `${SEO_SITE.url}/#organization`;
const WEBSITE_ID = `${SEO_SITE.url}/#website`;
const WEBAPP_ID = `${SEO_SITE.url}/#webapp`;

const ITEM_CONDITION: Partial<Record<AdType, string>> = {
  venda: "https://schema.org/NewCondition",
  servico: "https://schema.org/NewCondition",
};

function scriptPayload(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function baseOrganization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SEO_SITE.name,
    url: SEO_SITE.url,
    logo: {
      "@type": "ImageObject",
      url: SEO_SITE.logoUrl,
    },
  };
}

function baseWebSite(description: string) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SEO_SITE.name,
    url: SEO_SITE.url,
    description,
    inLanguage: SEO_SITE.language,
    publisher: { "@id": ORG_ID },
  };
}

function baseWebApplication(description: string) {
  return {
    "@type": "WebApplication",
    "@id": WEBAPP_ID,
    name: SEO_SITE.name,
    url: SEO_SITE.url,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    inLanguage: SEO_SITE.language,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    provider: { "@id": ORG_ID },
  };
}

export function buildSiteJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      baseOrganization(),
      baseWebSite(description),
      baseWebApplication(description),
      buildHomeFaqPage(),
    ],
  };
}

function buildHomeFaqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${SEO_SITE.url}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Como criar um anúncio grátis no Anuncio Link?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Preencha título, preço e descrição no formulário, adicione ícone e Pix se quiser, e clique em Gerar anúncio grátis. O link e o QR Code são criados na hora, sem cadastro.",
        },
      },
      {
        "@type": "Question",
        name: "O Anuncio Link guarda meus dados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Os dados do anúncio são codificados na URL que você compartilha. Não há banco de dados nem servidor armazenando título, Pix ou descrição.",
        },
      },
      {
        "@type": "Question",
        name: "Posso imprimir QR Code para vitrine?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. Após gerar o anúncio, baixe o QR Code em PNG ou imprima o cartaz A4 com layout profissional, pronto para vitrines e panfletos.",
        },
      },
    ],
  };
}

export function buildInstitutionalJsonLd(
  _view: InstitutionalView,
  pageUrl: string,
  title: string,
  description: string,
  breadcrumbLabel: string
) {
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SEO_SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbLabel,
        item: pageUrl,
      },
    ],
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: SEO_SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [baseOrganization(), baseWebSite(description), webPage, breadcrumb],
  };
}

export function buildAdProductJsonLd(ad: AdData, canonicalUrl: string, priceAmount?: string) {
  const safeTitle = sanitizePlainText(ad.title, 120);
  const safeDesc = sanitizePlainText(ad.desc, 300);
  const expiresAt = resolveAdExpiresAt(ad);

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: canonicalUrl,
    priceCurrency: "BRL",
    price: priceAmount ?? sanitizePlainText(ad.price, 32),
    availability: "https://schema.org/InStock",
    seller: { "@id": ORG_ID },
  };

  if (expiresAt !== undefined) {
    offer.priceValidUntil = new Date(expiresAt).toISOString().slice(0, 10);
  }

  const condition = ITEM_CONDITION[ad.t];
  if (condition) offer.itemCondition = condition;

  const entityType = ad.t === "servico" ? "Service" : "Product";
  const mainEntity: Record<string, unknown> = {
    "@type": entityType,
    "@id": `${canonicalUrl}#product`,
    name: safeTitle,
    description: safeDesc,
    image: [SEO_SITE.ogImage],
    url: canonicalUrl,
    inLanguage: SEO_SITE.language,
    brand: {
      "@type": "Brand",
      name: SEO_SITE.name,
    },
    offers: offer,
  };

  if (ad.t === "servico") {
    mainEntity.serviceType = safeTitle;
  }

  const webPage = {
    "@type": "ItemPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: safeTitle,
    description: safeDesc,
    inLanguage: SEO_SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": `${canonicalUrl}#product` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [baseOrganization(), baseWebSite(safeDesc), webPage, mainEntity],
  };
}

export function injectJsonLd(id: string, payload: unknown) {
  document.getElementById(id)?.remove();
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = scriptPayload(payload);
  document.head.appendChild(script);
}

export function removeAllJsonLd() {
  document.getElementById("site-jsonld")?.remove();
  document.getElementById("ad-jsonld")?.remove();
}
