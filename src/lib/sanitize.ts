/** Remove tags HTML, padrões de script e caracteres de controle — defesa XSS em dados da URL */
const HTML_TAG = /<[^>]*>/g;
const DANGEROUS_URI = /javascript:|data:text\/html|vbscript:/gi;
const EVENT_HANDLER = /\bon\w+\s*=/gi;

export function sanitizePlainText(value: string, maxLength?: number): string {
  if (!value) return "";
  const limit = maxLength ?? 10_000;
  return value
    .replace(HTML_TAG, "")
    .replace(DANGEROUS_URI, "")
    .replace(EVENT_HANDLER, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit);
}

/** Aceita apenas URLs http/https — bloqueia javascript: e esquemas exóticos */
export function sanitizeHttpUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const clean = sanitizePlainText(url, 2000);
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.href;
  } catch {
    return undefined;
  }
}
