/** Converte data URL de áudio em Blob URL — melhor compatibilidade iOS/Android */
export function resolveAudioPlaybackUrl(src: string): { url: string; revoke?: () => void } {
  if (!src.startsWith("data:")) {
    return { url: src };
  }

  try {
    const comma = src.indexOf(",");
    if (comma === -1) return { url: src };

    const header = src.slice(0, comma);
    const base64 = src.slice(comma + 1);
    const mimeMatch = header.match(/^data:([^;,]+)/);
    const mime = mimeMatch?.[1] ?? "audio/webm";

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl, revoke: () => URL.revokeObjectURL(objectUrl) };
  } catch {
    return { url: src };
  }
}
