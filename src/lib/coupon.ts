import type { AdData } from "../types/ad";
import { parsePriceToNumber } from "./formatters";

export const MAX_COUPON_CODE_LENGTH = 16;

export function normalizeCouponCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MAX_COUPON_CODE_LENGTH);
}

export function validateCouponConfig(code: string, percent: number): string | null {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  if (normalized.length < 3) return "O código do cupom deve ter pelo menos 3 caracteres.";
  if (!Number.isFinite(percent) || percent < 1 || percent > 99) {
    return "Informe um desconto entre 1% e 99%.";
  }
  return null;
}

export function hasActiveCoupon(ad: AdData): boolean {
  return Boolean(ad.couponCode && ad.couponPercent && ad.couponPercent > 0);
}

export function matchesCoupon(input: string, ad: AdData): boolean {
  if (!hasActiveCoupon(ad)) return false;
  return normalizeCouponCode(input) === normalizeCouponCode(ad.couponCode!);
}

export function applyDiscountToPrice(price: string, percent: number): string {
  const num = parsePriceToNumber(price);
  if (num === undefined) return price;
  const discounted = num * (1 - percent / 100);
  return discounted.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDiscountLabel(percent: number): string {
  return `${percent}% OFF`;
}
