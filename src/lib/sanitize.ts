/** Remove tags HTML, padrões de script e caracteres de controle — defesa XSS em dados da URL */
const HTML_TAG = /<[^>]*>/g;
const DANGEROUS_URI =
  /javascript\s*:|data\s*:|vbscript\s*:|file\s*:|blob\s*:|about\s*:/gi;
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

const BLOCKED_URL_PROTOCOLS = new Set([
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
]);

/** Aceita apenas URLs http/https — bloqueia esquemas perigosos */
export function sanitizeHttpUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const clean = sanitizePlainText(url, 2000);
  if (/^\s*(javascript|data|vbscript|file|blob|about)\s*:/i.test(clean)) {
    return undefined;
  }
  try {
    const parsed = new URL(clean);
    if (BLOCKED_URL_PROTOCOLS.has(parsed.protocol.toLowerCase())) return undefined;
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.href;
  } catch {
    return undefined;
  }
}
