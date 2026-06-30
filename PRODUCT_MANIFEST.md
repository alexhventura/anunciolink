# Manifesto do Produto — Anuncio Link

## O que é o Anuncio Link?

O **Anuncio Link** é uma ferramenta gratuita que transforma dados de um anúncio em uma **landing page instantânea**, compartilhável por link e QR Code. Tudo roda no navegador: os dados viajam **codificados na URL**, sem cadastro, sem servidor de dados e sem custo para o usuário.

Domínio oficial: https://www.anunciolink.com.br

---

## O que nunca será

- **Banco de dados** de anúncios ou usuários
- **Autenticação** ou contas
- **Upload** de arquivos ou imagens na UI
- **APIs pagas** ou APIs gratuitas com limites que quebrem o produto
- **Inteligência artificial** integrada
- **Backend proprietário** para armazenar anúncios
- **Marketplace** ou intermediação de pagamentos
- **Taxas** cobradas do usuário final pelo produto

---

## Princípios

1. **Custo zero** — hospedagem estática, processamento client-side, monetização opcional via AdSense.
2. **Link como fonte da verdade** — o anúncio *é* a URL; quem tem o link tem o anúncio.
3. **Retrocompatibilidade** — links antigos devem continuar abrindo.
4. **Simplicidade incremental** — melhorias pequenas e mensuráveis; sem reescritas por gosto pessoal.
5. **Identidade Bento** — Mostarda + Preto, neo-brutalist, blocos claros.
6. **Privacidade by design** — dados sensíveis só na URL que o vendedor compartilha.
7. **Performance first** — bundle enxuto, lazy load, Core Web Vitals.
8. **Acessibilidade** — navegação por teclado, ARIA, contraste legível.

---

## Como decidir futuras funcionalidades

Antes de implementar qualquer feature, responder:

1. Funciona **100% no cliente**?
2. Preserva **custo zero**?
3. **Não quebra** URLs existentes?
4. Tem **benefício mensurável** (performance, conversão, SEO, a11y)?
5. Respeita **Bento UI** (Mostarda/Preto)?
6. Pode ser feita de forma **incremental**?
7. Existe **teste** que protege o codec/payload?

Se qualquer resposta for “não”, a feature deve ser rejeitada ou redesenhada.

---

## Critérios para aceitar Pull Requests

- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] `npm run build` passa
- [ ] Não altera identidade visual (Bento, Mostarda, Preto)
- [ ] Não altera fluxo principal sem aprovação explícita
- [ ] Não adiciona dependência pesada sem justificativa
- [ ] URLs golden / retrocompat testadas se tocar codec ou wire
- [ ] Relatório técnico do que mudou e por quê
- [ ] Sem secrets (.env, tokens) commitados

---

## Critérios para manter custo zero

| Permitido | Proibido |
|-----------|----------|
| Hospedagem estática (Vercel free tier) | Banco de dados gerenciado |
| localStorage local | Backend com custo por request |
| AdSense (opcional, receita) | APIs pagas (maps, IA, SMS) |
| fflate, lucide, qrcode.react | Serviços com quota que bloqueie usuários |
| Domínio + SSL | Upload para S3/Cloudinary |

---

## Critérios de SEO

- Title ≤ 60 chars, description ≤ 155 chars
- Canonical e hreflang em todas as views
- JSON-LD Schema.org válido (Organization, WebSite, Product)
- Bootstrap síncrono de meta em `/a/*` antes do React
- `robots.txt` e `sitemap.xml` atualizados
- Anúncios user-generated indexáveis; páginas institucionais no sitemap
- OG image estático até existir solução serverless gratuita

---

## Critérios de Performance

- Entry JS gzip ≤ 15 kB (meta atual ~12 kB)
- Lazy load de views, codec, QR e ícones
- AdSense com IntersectionObserver
- Sem biblioteca de animação pesada
- Lighthouse Performance ≥ 90 em mobile (meta)

---

## Critérios de UX

- Fluxo: Formulário → Success → Link/QR → Landing comprador
- Microcopy claro, tom profissional, pt-BR
- Validação inline com mensagens acionáveis
- Tooltips acessíveis (Escape, ARIA)
- Feedback de loading e erro visível
- Payload score discreto durante preenchimento

---

## Critérios de acessibilidade

- Skip links para conteúdo principal e ações de pagamento
- `:focus-visible` em controles interativos
- Labels e `aria-describedby` em campos de formulário
- Navegação por teclado em IconPicker e ThemePicker
- Contraste WCAG AA mínimo em textos e chips
- `prefers-reduced-motion` respeitado

---

## Arquitetura de referência (pós Prompts 13–24)

```
Formulário → AdBuilder → Validator → Normalizer → AdSerializer → Codec → URL
Bootstrap / Routing / Hook → DocumentHeadService → <head>
Decode legado (img/crop) → fromCompactWire — encode de imagem removido
Testes: vitest em adWire, adCodec, adSerializer, sanitize
```

---

*Última atualização: junho de 2026 — Prompts 13–24*
