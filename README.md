# Anuncio Link

Plataforma de desapego ultra-rápida — crie anúncio com foto, Pix e link compartilhável em segundos. **Custo zero:** 100% client-side, sem banco de dados, sem API paga.

Site: [www.anunciolink.com.br](https://www.anunciolink.com.br)

## Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS 4
- Dados do anúncio compactados na URL (`/a/v2...`) via Deflate + WebP
- Hospedagem estática (Vercel / Netlify)

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # opcional — AdSense
npm run dev
```

Abre em `http://localhost:3000`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção → `dist/` |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação TypeScript |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (opcional):

- `VITE_ADSENSE_CLIENT_ID`
- `VITE_ADSENSE_SLOT_TOP` / `MID` / `FOOT`

Nunca commite `.env.local`.

## Deploy

```bash
npm run build
```

Publique a pasta `dist/` na Vercel ou Netlify. O projeto inclui `vercel.json` e `public/_redirects` para rotas `/a/*`.

## Licença

Código fonte sob Apache-2.0 (ver cabeçalhos nos arquivos).
