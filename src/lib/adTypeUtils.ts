import type { AdType, BillingType } from "../types/ad";

/** Tipos disponíveis no formulário de criação */
export const AD_TYPE_OPTIONS: ReadonlyArray<{ id: AdType; label: string }> = [
  { id: "venda", label: "Venda" },
  { id: "servico", label: "Serviço" },
  { id: "vaquinha", label: "Vaquinha" },
  { id: "aviso", label: "Aviso" },
] as const;

export const AD_TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
  aviso: "Aviso",
};

/** Aviso/informativo não exige preço nem cobrança */
export function adTypeRequiresPrice(adType: AdType): boolean {
  return adType !== "aviso";
}

/** Texto exibido no lugar do preço (hero, card, export) */
export function formatAdPriceDisplay(
  adType: AdType,
  price: string,
  billingType: BillingType = "unico"
): string {
  const trimmed = price.trim();
  if (!adTypeRequiresPrice(adType) || !trimmed) {
    return "Sem valor";
  }
  return trimmed + (billingType === "recorrente" ? " /mês" : "");
}
