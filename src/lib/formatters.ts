export function sanitizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 || cleaned.length === 11) {
    return "55" + cleaned;
  }
  return cleaned;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("55") && (cleaned.length === 12 || cleaned.length === 13)) {
    cleaned = cleaned.substring(2);
  }

  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  if (cleaned.length > 2) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  }
  if (cleaned.length > 0) {
    return `(${cleaned}`;
  }
  return phone;
}

export function formatBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const numericValue = parseFloat(digits) / 100;
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parsePriceToNumber(price: string): number | undefined {
  const digits = price.replace(/\D/g, "");
  if (!digits) return undefined;
  return parseFloat(digits) / 100;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function isValidPaymentUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
