import type { AdData } from "../../types/ad";

export const FIXTURE_TIMESTAMP = 1_700_000_000_000;
export const FIXTURE_EXPIRES = FIXTURE_TIMESTAMP + 30 * 24 * 60 * 60 * 1000;

/** Anúncio mínimo v2 (ícone + tema default omitido no wire) */
export const MINIMAL_AD: AdData = {
  t: "venda",
  title: "Produto Teste",
  price: "R$ 99,00",
  desc: "Descrição de teste com conteúdo suficiente para validação.",
  phone: "11999998888",
  timestamp: FIXTURE_TIMESTAMP,
  expiresAt: FIXTURE_EXPIRES,
};

export const FULL_AD: AdData = {
  ...MINIMAL_AD,
  billingType: "recorrente",
  pix: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000",
  cardLink: "https://mpago.la/example",
  icon: 42,
  theme: "sunset",
};

/** Wire legado expandido (pré-v2) */
export const LEGACY_EXPANDED = {
  t: "servico",
  title: "Servico Legado",
  price: "R$ 150,00",
  desc: "Anúncio legado em JSON expandido para retrocompatibilidade.",
  phone: "21988887777",
  timestamp: FIXTURE_TIMESTAMP,
};

/** Wire compacto inline (como aparece após normalizeLegacyAd) */
export const COMPACT_WIRE = {
  t: "venda" as const,
  ti: "Produto Teste",
  p: "R$ 99,00",
  d: "Descrição de teste com conteúdo suficiente para validação.",
  ph: "11999998888",
  ts: FIXTURE_TIMESTAMP,
  ex: FIXTURE_EXPIRES,
};

/** Wire legado com imagem embutida (decode-only) */
export const LEGACY_WITH_IMAGE = {
  ...LEGACY_EXPANDED,
  img: "j:/9j/4AAQSkZJRgABAQEASABIAAD/2wBD",
  crop: { zoom: 1.2, panX: 5, panY: -3 },
};

export const INVALID_PAYLOADS = [
  "",
  "   ",
  "not-valid-base64!!!",
  "v2.",
  "v2.not-valid!!!",
  "v2.aaaaaaaa",
];
