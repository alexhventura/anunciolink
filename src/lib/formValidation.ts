import { isValidAdPassword, sanitizeAdPassword } from "./adLock";
import type { AdType } from "../types/ad";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH } from "./constants";
import { isValidPaymentUrl, parsePriceToNumber } from "./formatters";

export type AdFormFieldKey =
  | "title"
  | "price"
  | "description"
  | "phone"
  | "pix"
  | "cardLink"
  | "password";

export type AdFormFieldErrors = Partial<Record<AdFormFieldKey, string>>;

export interface AdFormValues {
  adType: AdType;
  title: string;
  price: string;
  description: string;
  phone: string;
  pix: string;
  cardLink: string;
  password: string;
}

function phoneDigits(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("55") && (cleaned.length === 12 || cleaned.length === 13)) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

export function validateAdFormField(field: AdFormFieldKey, values: AdFormValues): string | null {
  switch (field) {
    case "title": {
      const value = values.title.trim();
      if (!value) return "Dê um nome ao seu anúncio.";
      if (value.length < 3) return "Use pelo menos 3 caracteres.";
      if (value.length > MAX_TITLE_LENGTH) return `Máximo de ${MAX_TITLE_LENGTH} caracteres.`;
      return null;
    }
    case "price": {
      const amount = parsePriceToNumber(values.price);
      if (!values.price.trim()) return "Informe o valor.";
      if (amount === undefined || amount <= 0) return "O valor precisa ser maior que zero.";
      return null;
    }
    case "description": {
      const value = values.description.trim();
      if (!value) return "Conte o que você vende ou oferece.";
      if (value.length < 10) return "Use pelo menos 10 caracteres — ajuda quem compra a decidir.";
      if (value.length > MAX_DESC_LENGTH) return `Máximo de ${MAX_DESC_LENGTH} caracteres.`;
      return null;
    }
    case "phone": {
      if (!values.phone.trim()) return null;
      const digits = phoneDigits(values.phone);
      if (digits.length < 10 || digits.length > 11) {
        return "Informe DDD + número (10 ou 11 dígitos).";
      }
      return null;
    }
    case "pix": {
      if (!values.pix.trim()) return null;
      if (values.pix.length < 20) return "Cole o Pix copia e cola completo.";
      if (values.pix.length > MAX_PIX_LENGTH) return `Máximo de ${MAX_PIX_LENGTH} caracteres.`;
      return null;
    }
    case "cardLink": {
      if (!values.cardLink.trim()) return null;
      if (!isValidPaymentUrl(values.cardLink)) {
        return "Use um link https:// válido (Mercado Pago, Stripe, etc.).";
      }
      return null;
    }
    case "password": {
      if (!values.password.trim()) return null;
      const normalized = sanitizeAdPassword(values.password);
      if (!isValidAdPassword(normalized)) {
        return "Use 1 a 4 caracteres — apenas letras e números.";
      }
      return null;
    }
    default:
      return null;
  }
}

export function validateRequiredAdForm(values: AdFormValues): AdFormFieldErrors {
  const errors: AdFormFieldErrors = {};
  for (const field of ["title", "price", "description"] as const) {
    const message = validateAdFormField(field, values);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateOptionalAdForm(values: AdFormValues): AdFormFieldErrors {
  const errors: AdFormFieldErrors = {};
  for (const field of ["phone", "pix", "cardLink", "password"] as const) {
    const message = validateAdFormField(field, values);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateAdForm(values: AdFormValues): AdFormFieldErrors {
  return { ...validateRequiredAdForm(values), ...validateOptionalAdForm(values) };
}

export function hasAdFormErrors(errors: AdFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstAdFormError(errors: AdFormFieldErrors): string | null {
  const order: AdFormFieldKey[] = [
    "title",
    "price",
    "description",
    "phone",
    "pix",
    "cardLink",
    "password",
  ];
  for (const key of order) {
    if (errors[key]) return errors[key]!;
  }
  return null;
}
