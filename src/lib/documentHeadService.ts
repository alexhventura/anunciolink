import type { AdData, AppView } from "../types/ad";
import { getPathForInstitutionalView, isInstitutionalView } from "./siteRoutes";
import { SITE_URL } from "./constants";
import { getAdCanonicalUrl } from "./adRoutes";
import {
  buildAdProductJsonLd,
  buildInstitutionalJsonLd,
  buildSiteJsonLd,
  injectJsonLd,
} from "./jsonLd";
import {
  buildAdPageSeo,
  HOME_SEO,
  INSTITUTIONAL_SEO,
  SEO_SITE,
  type PageSeoMeta,
} from "./seoMeta";

function upsertMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMeta(name: string, attribute: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  document.querySelector(`meta[${attribute}="${name}"]`)?.remove();
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  if (typeof document === "undefined") return;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function applyTechnicalSeo(meta: PageSeoMeta) {
  upsertMeta("robots", meta.robots);
  upsertMeta("googlebot", meta.robots);
  upsertMeta("application-name", SEO_SITE.name);
  upsertLink("canonical", meta.canonicalUrl);
  upsertLink("alternate", meta.canonicalUrl, SEO_SITE.locale);
}

function applyCommonSocialMeta(meta: PageSeoMeta) {
  const imageUrl = SEO_SITE.ogImage;

  document.title = meta.title;
  upsertMeta("description", meta.description);

  upsertMeta("og:title", meta.title, "property");
  upsertMeta("og:description", meta.description, "property");
  upsertMeta("og:type", meta.ogType, "property");
  upsertMeta("og:url", meta.canonicalUrl, "property");
  upsertMeta("og:site_name", SEO_SITE.name, "property");
  upsertMeta("og:locale", "pt_BR", "property");
  upsertMeta("og:locale:alternate", "pt_PT", "property");
  upsertMeta("og:image", imageUrl, "property");
  upsertMeta("og:image:secure_url", imageUrl, "property");
  upsertMeta("og:image:width", "1200", "property");
  upsertMeta("og:image:height", "630", "property");
  upsertMeta("og:image:type", "image/jpeg", "property");
  upsertMeta("og:image:alt", meta.imageAlt, "property");

  if (meta.ogType === "product" && meta.priceAmount) {
    upsertMeta("product:price:amount", meta.priceAmount, "property");
    upsertMeta("product:price:currency", meta.priceCurrency ?? "BRL", "property");
  } else {
    removeMeta("product:price:amount", "property");
    removeMeta("product:price:currency", "property");
  }

  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", meta.title);
  upsertMeta("twitter:description", meta.description);
  upsertMeta("twitter:image", imageUrl);
  upsertMeta("twitter:image:alt", meta.imageAlt);
  upsertMeta("twitter:domain", "anunciolink.com.br");

  applyTechnicalSeo(meta);
}

let lastAppliedKey = "";

/** Serviço único de document head — title, meta, OG, Twitter, JSON-LD */
export const DocumentHeadService = {
  apply(view: AppView, ad: AdData | null): void {
    if (typeof document === "undefined") return;

    const key =
      view === "anuncio" && ad
        ? `anuncio:${ad.timestamp}:${ad.title}:${ad.price}`
        : view;
    if (key === lastAppliedKey) return;
    lastAppliedKey = key;

    if (view === "anuncio" && ad) {
      this.applyAd(ad);
    } else if (isInstitutionalView(view)) {
      this.applyInstitutional(view);
    } else {
      this.applyHome();
    }
  },

  applyAd(ad: AdData): void {
    if (typeof document === "undefined") return;
    const canonicalUrl = getAdCanonicalUrl();
    const meta = buildAdPageSeo(ad, canonicalUrl);
    applyCommonSocialMeta(meta);
    injectJsonLd("ad-jsonld", buildAdProductJsonLd(ad, canonicalUrl, meta.priceAmount));
  },

  applyHome(): void {
    if (typeof document === "undefined") return;
    const meta: PageSeoMeta = { ...HOME_SEO, canonicalUrl: SITE_URL };
    applyCommonSocialMeta(meta);
    injectJsonLd("site-jsonld", buildSiteJsonLd(meta.description));
  },

  applyInstitutional(
    view: Extract<AppView, "como-funciona" | "sobre" | "privacidade" | "termos">
  ): void {
    if (typeof document === "undefined") return;
    const seo = INSTITUTIONAL_SEO[view];
    const pageUrl = `${SITE_URL}${getPathForInstitutionalView(view)}`;
    const meta: PageSeoMeta = {
      title: seo.title,
      description: seo.description,
      canonicalUrl: pageUrl,
      robots: "index, follow, max-image-preview:large",
      ogType: "website",
      imageAlt: `${seo.breadcrumb} — ${SEO_SITE.name}`,
    };
    applyCommonSocialMeta(meta);
    injectJsonLd(
      "site-jsonld",
      buildInstitutionalJsonLd(view, pageUrl, meta.title, meta.description, seo.breadcrumb)
    );
  },

  _resetCache(): void {
    lastAppliedKey = "";
  },
};
