import type { AudioRecorderError } from "../types/ad";

export const MAX_AUDIO_DURATION_MS = 10_000;
/** Limite bruto antes do base64 — mantém a URL dentro do orçamento */
export const MAX_AUDIO_BYTES = 18_000;

export function getPreferredAudioMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "audio/webm";
}

export function isAudioRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler o áudio gravado."));
    reader.readAsDataURL(blob);
  });
}

export function validateRecordedAudio(blob: Blob): AudioRecorderError | null {
  if (blob.size > MAX_AUDIO_BYTES) {
    return {
      code: "TOO_LARGE",
      message:
        "O áudio ficou grande demais para o link. Grave novamente falando de forma mais breve (máx. 10s).",
    };
  }
  if (blob.size < 100) {
    return { code: "RECORD_FAILED", message: "A gravação ficou vazia. Tente novamente." };
  }
  return null;
}

export function mapRecordingError(err: unknown): AudioRecorderError {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return {
        code: "PERMISSION_DENIED",
        message: "Permita o acesso ao microfone para gravar o áudio do produto.",
      };
    }
    if (err.name === "NotFoundError") {
      return { code: "NOT_SUPPORTED", message: "Nenhum microfone encontrado neste aparelho." };
    }
  }
  const message = err instanceof Error ? err.message : "Não foi possível gravar o áudio.";
  return { code: "RECORD_FAILED", message };
}
