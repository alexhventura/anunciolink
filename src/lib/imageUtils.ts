/** Helpers para wire de imagem embutida (anúncios legados) */

export function isEmbeddedImageData(value: string): boolean {
  if (!value?.trim()) return false;
  return (
    value.startsWith("data:image/") ||
    value.startsWith("w:") ||
    value.startsWith("j:") ||
    value.startsWith("u:") ||
    value.startsWith("blob:")
  );
}

export function stripImageForWire(value: string): string {
  if (value.startsWith("u:") || value.startsWith("w:") || value.startsWith("j:")) return value;
  const webpMatch = value.match(/^data:image\/webp;base64,(.+)$/);
  if (webpMatch) return `w:${webpMatch[1]}`;
  const jpegMatch = value.match(/^data:image\/(?:jpeg|jpg);base64,(.+)$/);
  if (jpegMatch) return `j:${jpegMatch[1]}`;
  if (value.startsWith("data:image/")) return value;
  return `j:${value}`;
}

export function expandImageFromWire(compact: string): string {
  if (compact.startsWith("u:")) {
    try {
      let normalized = compact.slice(2).replace(/-/g, "+").replace(/_/g, "/");
      while (normalized.length % 4) normalized += "=";
      const bin = atob(normalized);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch {
      return compact;
    }
  }
  if (compact.startsWith("w:")) return `data:image/webp;base64,${compact.slice(2)}`;
  if (compact.startsWith("j:")) return `data:image/jpeg;base64,${compact.slice(2)}`;
  if (compact.startsWith("data:image/")) return compact;
  return `data:image/jpeg;base64,${compact}`;
}
