import type { AdType } from "../types/ad";

/** Categorias do catálogo — IDs estáveis para UI e busca */
export enum AdIconCategoryId {
  Geral = 0,
  Eletronicos = 1,
  Casa = 2,
  Moda = 3,
  Veiculos = 4,
  Comida = 5,
  Servicos = 6,
  Saude = 7,
  Pets = 8,
  Solidario = 9,
  Lazer = 10,
  Natureza = 11,
}

/** IDs compactos no payload (0–119). Novos ícones só no fim da categoria. */
export type AdIconId = number;

export const AD_ICON_COUNT = 120;

/** Defaults por tipo — omitidos no wire quando iguais */
export const DEFAULT_AD_ICON_ID: Record<AdType, AdIconId> = {
  venda: 0,
  servico: 60,
  vaquinha: 90,
};

export interface AdIconCategory {
  id: AdIconCategoryId;
  slug: string;
  label: string;
}

export interface AdIconDefinition {
  id: AdIconId;
  categoryId: AdIconCategoryId;
  lucideKey: string;
  label: string;
  keywords: string[];
}

export const AD_ICON_CATEGORIES: AdIconCategory[] = [
  { id: AdIconCategoryId.Geral, slug: "geral", label: "Geral" },
  { id: AdIconCategoryId.Eletronicos, slug: "eletronicos", label: "Eletrônicos" },
  { id: AdIconCategoryId.Casa, slug: "casa", label: "Casa" },
  { id: AdIconCategoryId.Moda, slug: "moda", label: "Moda" },
  { id: AdIconCategoryId.Veiculos, slug: "veiculos", label: "Veículos" },
  { id: AdIconCategoryId.Comida, slug: "comida", label: "Comida" },
  { id: AdIconCategoryId.Servicos, slug: "servicos", label: "Serviços" },
  { id: AdIconCategoryId.Saude, slug: "saude", label: "Saúde" },
  { id: AdIconCategoryId.Pets, slug: "pets", label: "Pets" },
  { id: AdIconCategoryId.Solidario, slug: "solidario", label: "Solidário" },
  { id: AdIconCategoryId.Lazer, slug: "lazer", label: "Lazer" },
  { id: AdIconCategoryId.Natureza, slug: "natureza", label: "Natureza" },
];

const ICON_ROWS: Array<{ categoryId: AdIconCategoryId; lucideKey: string; label: string; keywords?: string[] }> = [
  // Geral 0–9
  { categoryId: AdIconCategoryId.Geral, lucideKey: "package", label: "Pacote", keywords: ["caixa", "produto"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "tag", label: "Etiqueta", keywords: ["preço", "promoção"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "star", label: "Estrela", keywords: ["destaque", "favorito"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "flame", label: "Oferta", keywords: ["quente", "urgente"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "sparkles", label: "Novidade", keywords: ["brilho", "lançamento"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "gem", label: "Premium", keywords: ["joia", "luxo"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "gift", label: "Presente", keywords: ["mimo", "surpresa"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "shopping-bag", label: "Compras", keywords: ["loja", "sacola"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "megaphone", label: "Anúncio", keywords: ["divulgação", "marketing"] },
  { categoryId: AdIconCategoryId.Geral, lucideKey: "lightbulb", label: "Ideia", keywords: ["dica", "inovação"] },
  // Eletrônicos 10–19
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "smartphone", label: "Celular", keywords: ["telefone", "mobile"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "laptop", label: "Notebook", keywords: ["computador", "pc"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "monitor", label: "Monitor", keywords: ["tela", "display"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "watch", label: "Relógio", keywords: ["smartwatch", "pulseira"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "headphones", label: "Fone", keywords: ["áudio", "música"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "camera", label: "Câmera", keywords: ["foto", "vídeo"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "gamepad-2", label: "Games", keywords: ["videogame", "console"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "printer", label: "Impressora", keywords: ["papel", "escritório"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "tv", label: "TV", keywords: ["televisão", "sala"] },
  { categoryId: AdIconCategoryId.Eletronicos, lucideKey: "plug", label: "Elétrica", keywords: ["tomada", "energia"] },
  // Casa 20–29
  { categoryId: AdIconCategoryId.Casa, lucideKey: "house", label: "Casa", keywords: ["imóvel", "lar"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "armchair", label: "Sofá", keywords: ["sala", "móvel"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "layers", label: "Móvel", keywords: ["estante", "decoração"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "bed", label: "Cama", keywords: ["quarto", "colchão"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "shopping-basket", label: "Cesta", keywords: ["organização", "cozinha"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "flower-2", label: "Planta", keywords: ["jardim", "vaso"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "lamp", label: "Luminária", keywords: ["luz", "iluminação"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "wrench", label: "Ferramenta", keywords: ["reparo", "manutenção"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "shower-head", label: "Banheiro", keywords: ["chuveiro", "higiene"] },
  { categoryId: AdIconCategoryId.Casa, lucideKey: "brush", label: "Limpeza", keywords: ["faxina", "vassoura"] },
  // Moda 30–39
  { categoryId: AdIconCategoryId.Moda, lucideKey: "shirt", label: "Camisa", keywords: ["roupa", "vestuário"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "scissors", label: "Costura", keywords: ["alfaiate", "tecido"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "footprints", label: "Calçado", keywords: ["tênis", "sapato"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "handbag", label: "Bolsa", keywords: ["acessório", "couro"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "hard-hat", label: "Chapéu", keywords: ["boné", "gorro"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "gem", label: "Joia", keywords: ["anel", "colar"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "glasses", label: "Óculos", keywords: ["lente", "armação"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "ribbon", label: "Laço", keywords: ["fita", "detalhe"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "sparkles", label: "Fashion", keywords: ["estilo", "tendência"] },
  { categoryId: AdIconCategoryId.Moda, lucideKey: "backpack", label: "Mochila", keywords: ["escolar", "viagem"] },
  // Veículos 40–49
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "car", label: "Carro", keywords: ["automóvel", "auto"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "motorbike", label: "Moto", keywords: ["motocicleta", "duas rodas"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "circle-dot", label: "Bicicleta", keywords: ["bike", "pedal"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "circle-dot", label: "Patinete", keywords: ["scooter", "elétrico"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "bus", label: "Van", keywords: ["ônibus", "transporte"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "circle-dot", label: "Pneu", keywords: ["roda", "estepe"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "fuel", label: "Combustível", keywords: ["gasolina", "posto"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "truck", label: "Caminhonete", keywords: ["pickup", "carga"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "car-front", label: "SUV", keywords: ["utilitário", "garagem"] },
  { categoryId: AdIconCategoryId.Veiculos, lucideKey: "circle-dot", label: "Patinete elétrico", keywords: ["mobilidade", "urbano"] },
  // Comida 50–59
  { categoryId: AdIconCategoryId.Comida, lucideKey: "utensils-crossed", label: "Refeição", keywords: ["restaurante", "lanche"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "pizza", label: "Pizza", keywords: ["italiana", "fatia"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "cake", label: "Bolo", keywords: ["confeitaria", "doce"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "coffee", label: "Café", keywords: ["bebida", "barista"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "beer", label: "Bebida", keywords: ["cerveja", "bar"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "salad", label: "Salada", keywords: ["saudável", "verde"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "fish", label: "Sushi", keywords: ["peixe", "japonês"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "cake", label: "Cupcake", keywords: ["docinho", "festa"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "cup-soda", label: "Refrigerante", keywords: ["suco", "copo"] },
  { categoryId: AdIconCategoryId.Comida, lucideKey: "candy", label: "Chocolate", keywords: ["doce", "guloseima"] },
  // Serviços 60–69
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "wrench", label: "Serviço", keywords: ["conserto", "técnico"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "hammer", label: "Obra", keywords: ["construção", "marceneiro"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "scissors", label: "Corte", keywords: ["barbearia", "salão"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "users", label: "Beleza", keywords: ["cabelo", "estética"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "brush", label: "Limpeza profissional", keywords: ["faxina", "doméstica"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "truck", label: "Frete", keywords: ["entrega", "mudança"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "clipboard-list", label: "Consultoria", keywords: ["projeto", "planejamento"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "briefcase", label: "Negócios", keywords: ["empresa", "corporativo"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "graduation-cap", label: "Aulas", keywords: ["curso", "ensino"] },
  { categoryId: AdIconCategoryId.Servicos, lucideKey: "dumbbell", label: "Fitness", keywords: ["academia", "treino"] },
  // Saúde 70–79
  { categoryId: AdIconCategoryId.Saude, lucideKey: "pill", label: "Remédio", keywords: ["farmácia", "medicamento"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "hospital", label: "Hospital", keywords: ["clínica", "emergência"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "stethoscope", label: "Médico", keywords: ["consulta", "saúde"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "heart", label: "Odonto", keywords: ["dente", "sorriso"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "heart-handshake", label: "Bem-estar", keywords: ["yoga", "equilíbrio"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "hand-heart", label: "Terapia", keywords: ["massagem", "cuidado"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "bandage", label: "Primeiros socorros", keywords: ["curativo", "ferimento"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "sparkles", label: "Cosméticos", keywords: ["beleza", "skincare"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "baby", label: "Bebê", keywords: ["infantil", "maternidade"] },
  { categoryId: AdIconCategoryId.Saude, lucideKey: "paw-print", label: "Veterinário", keywords: ["pet", "animal"] },
  // Pets 80–89
  { categoryId: AdIconCategoryId.Pets, lucideKey: "dog", label: "Cachorro", keywords: ["cão", "canino"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "cat", label: "Gato", keywords: ["felino", "bichano"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "bird", label: "Pássaro", keywords: ["ave", "calopsita"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "fish", label: "Peixe", keywords: ["aquário", "aquático"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "rabbit", label: "Hamster", keywords: ["roedor", "coelho"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "rabbit", label: "Coelho", keywords: ["pet", "pequeno"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "bone", label: "Osso", keywords: ["petisco", "brinquedo"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "paw-print", label: "Pata", keywords: ["animal", "amigo"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "bird", label: "Papagaio", keywords: ["ave", "exótico"] },
  { categoryId: AdIconCategoryId.Pets, lucideKey: "turtle", label: "Tartaruga", keywords: ["réptil", "exótico"] },
  // Solidário 90–99
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "heart", label: "Solidário", keywords: ["amor", "doação"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "handshake", label: "Ajuda", keywords: ["parceria", "apoio"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "heart-handshake", label: "Gratidão", keywords: ["oração", "fé"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "leaf", label: "Sustentável", keywords: ["verde", "meio ambiente"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "sprout", label: "Causa verde", keywords: ["planta", "replantio"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "hospital", label: "Saúde social", keywords: ["tratamento", "campanha"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "book-open", label: "Educação", keywords: ["livro", "escola"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "soup", label: "Alimentação", keywords: ["sopa", "fome"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "dog", label: "Abrigo", keywords: ["animais", "resgate"] },
  { categoryId: AdIconCategoryId.Solidario, lucideKey: "users", label: "Família", keywords: ["comunidade", "grupo"] },
  // Lazer 100–109
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "circle-dot", label: "Esporte", keywords: ["bola", "futebol"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "guitar", label: "Música", keywords: ["instrumento", "banda"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "palette", label: "Arte", keywords: ["pintura", "criativo"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "book-open", label: "Leitura", keywords: ["livro", "literatura"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "tv", label: "Cinema", keywords: ["filme", "série"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "umbrella", label: "Praia", keywords: ["férias", "verão"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "tent", label: "Evento", keywords: ["circo", "festa"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "target", label: "Jogo", keywords: ["alvo", "diversão"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "mic", label: "Show", keywords: ["karaokê", "palco"] },
  { categoryId: AdIconCategoryId.Lazer, lucideKey: "puzzle", label: "Quebra-cabeça", keywords: ["hobby", "lógica"] },
  // Natureza 110–119
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "flower-2", label: "Flor", keywords: ["girassol", "jardim"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "tree-pine", label: "Árvore", keywords: ["floresta", "madeira"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "apple", label: "Fruta", keywords: ["maçã", "hortifruti"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "cherry", label: "Orgânico", keywords: ["abacate", "natural"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "wheat", label: "Grãos", keywords: ["agro", "plantação"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "circle-dot", label: "Fazenda", keywords: ["gado", "rural"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "leaf", label: "Folha", keywords: ["verde", "erva"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "cherry", label: "Uva", keywords: ["vinho", "fruta"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "wheat", label: "Milho", keywords: ["agricultura", "safra"] },
  { categoryId: AdIconCategoryId.Natureza, lucideKey: "bug", label: "Abelha", keywords: ["inseto", "polinização"] },
];

export const AD_ICON_REGISTRY: AdIconDefinition[] = ICON_ROWS.map((row, index) => ({
  id: index,
  categoryId: row.categoryId,
  lucideKey: row.lucideKey,
  label: row.label,
  keywords: row.keywords ?? [],
}));

const ICON_BY_ID = new Map(AD_ICON_REGISTRY.map((def) => [def.id, def]));

/** Emojis legados (wire v2) → ID Lucide equivalente */
const LEGACY_EMOJI_TO_ID: Record<string, AdIconId> = {
  "📦": 0,
  "🏷️": 1,
  "⭐": 2,
  "🔥": 3,
  "✨": 4,
  "💎": 5,
  "🎁": 6,
  "🛍️": 7,
  "📢": 8,
  "💡": 9,
  "📱": 10,
  "💻": 11,
  "🖥️": 12,
  "⌚": 13,
  "🎧": 14,
  "📷": 15,
  "🎮": 16,
  "🖨️": 17,
  "📺": 18,
  "🔌": 19,
  "🏠": 20,
  "🛋️": 21,
  "🪑": 22,
  "🛏️": 23,
  "🧺": 24,
  "🪴": 25,
  "🔧": 27,
  "🚿": 28,
  "🧹": 29,
  "👕": 30,
  "👗": 31,
  "👟": 32,
  "👜": 33,
  "🧢": 34,
  "💍": 35,
  "👓": 36,
  "👠": 38,
  "🎒": 39,
  "🚗": 40,
  "🏍️": 41,
  "🚲": 42,
  "🛵": 43,
  "🚐": 44,
  "🛞": 45,
  "⛽": 46,
  "🛻": 47,
  "🚙": 48,
  "🛴": 49,
  "🍔": 50,
  "🍕": 51,
  "🍰": 52,
  "☕": 53,
  "🍺": 54,
  "🥗": 55,
  "🍣": 56,
  "🧁": 57,
  "🥤": 58,
  "🍫": 59,
  "🛠️": 60,
  "🔨": 61,
  "✂️": 62,
  "💇": 63,
  "🚚": 65,
  "📋": 66,
  "💼": 67,
  "🎓": 68,
  "🏋️": 69,
  "💊": 70,
  "🏥": 71,
  "🩺": 72,
  "🦷": 73,
  "🧘": 74,
  "💆": 75,
  "🩹": 76,
  "🧴": 77,
  "👶": 78,
  "🐾": 79,
  "🐶": 80,
  "🐱": 81,
  "🐦": 82,
  "🐠": 83,
  "🐹": 84,
  "🐰": 85,
  "🦴": 86,
  "🦜": 88,
  "🐢": 89,
  "❤️": 90,
  "🤝": 91,
  "🙏": 92,
  "💚": 93,
  "🌱": 94,
  "📚": 96,
  "🍲": 97,
  "🐕": 98,
  "👨‍👩‍👧": 99,
  "⚽": 100,
  "🎸": 101,
  "🎨": 102,
  "🎬": 104,
  "🏖️": 105,
  "🎪": 106,
  "🎯": 107,
  "🎤": 108,
  "🧩": 109,
  "🌻": 110,
  "🌳": 111,
  "🍎": 112,
  "🥑": 113,
  "🌾": 114,
  "🐄": 115,
  "🌿": 116,
  "🍇": 117,
  "🌽": 118,
  "🐝": 119,
};

export function isValidAdIconId(value: unknown): value is AdIconId {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < AD_ICON_COUNT;
}

export function getAdIconDefinition(id: AdIconId): AdIconDefinition | undefined {
  return ICON_BY_ID.get(id);
}

export function resolveAdIconId(icon: AdIconId | undefined, adType: AdType): AdIconId {
  if (icon !== undefined && isValidAdIconId(icon)) return icon;
  return DEFAULT_AD_ICON_ID[adType];
}

/** Decodifica wire `e` — número, string numérica ou emoji legado */
export function decodeIconFromWire(value: unknown): AdIconId | undefined {
  if (typeof value === "number" && isValidAdIconId(value)) return value;
  if (typeof value === "string") {
    if (/^\d+$/.test(value)) {
      const id = Number(value);
      return isValidAdIconId(id) ? id : undefined;
    }
    return LEGACY_EMOJI_TO_ID[value];
  }
  return undefined;
}

/** Omite no wire quando igual ao default do tipo */
export function iconIdForWire(icon: AdIconId | undefined, adType: AdType): AdIconId | undefined {
  const resolved = resolveAdIconId(icon, adType);
  return resolved === DEFAULT_AD_ICON_ID[adType] ? undefined : resolved;
}

export function searchAdIcons(query: string, categoryId?: AdIconCategoryId): AdIconDefinition[] {
  const normalized = query.trim().toLowerCase();
  const pool =
    categoryId === undefined
      ? AD_ICON_REGISTRY
      : AD_ICON_REGISTRY.filter((def) => def.categoryId === categoryId);

  if (!normalized) return pool;

  return pool.filter((def) => {
    if (def.label.toLowerCase().includes(normalized)) return true;
    if (String(def.id).includes(normalized)) return true;
    return def.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
  });
}

export function getCategoryBySlug(slug: string): AdIconCategory | undefined {
  return AD_ICON_CATEGORIES.find((cat) => cat.slug === slug);
}
