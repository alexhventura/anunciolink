# Auditoria SEO — Anuncio Link
**Data:** 27/06/2026

## Title
- Home: ≤ 60 chars, keyword + marca ✅
- Institucional: `buildSeoTitle()` com sufixo ` | Anuncio Link` ✅
- Anúncio: título + preço + marca via `buildAdPageSeo()` ✅

## Description
- Truncamento em 155 chars via `buildSeoDescription()` ✅
- Bootstrap síncrono em `/a/*` antes do React ✅

## Schema (JSON-LD)
- Home: Organization + WebSite + WebApplication (estático + dinâmico) ✅
- Institucional: + BreadcrumbList ✅
- Anúncio: Product/Offer com preço BRL ✅

## Canonical
- `DocumentHeadService` upsert por view ✅
- Anúncio: `window.location.origin + pathname` ✅

## Robots
- `index, follow, max-image-preview:large` em páginas públicas ✅
- `robots.txt` allow `/a/` ✅

## Sitemap
- Home + 4 institucionais ✅
- Anúncios UGC fora do sitemap (correto — infinitos) ✅

## Internal Linking
- Footer: Como Funciona, Sobre, Privacidade, Termos ✅
- Header: navegação SPA ✅

## Rich Results
- Product schema com Offer/price ✅
- OG product:price meta em anúncios ✅
- OG image: estático (`og-default.jpg`) — limitação conhecida ⚠️

## Lighthouse (meta)
- Performance: lazy + bootstrap — medir pós-deploy
- SEO: meta dinâmica + JSON-LD — esperado ≥ 95
- A11y: skip links, ARIA — esperado ≥ 90

## Ações futuras (fora de escopo)
- OG image dinâmica por anúncio (edge function)
- `noindex` automático para anúncios expirados
