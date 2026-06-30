import { useCallback, useMemo } from "react";

interface SharePayload {
  title: string;
  text: string;
  url: string;
}

interface ShareFilePayload extends SharePayload {
  file: File;
}

export function useNativeShare() {
  const canShare = useMemo(() => {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    return true;
  }, []);

  const share = useCallback(
    async (payload: SharePayload): Promise<"shared" | "cancelled" | "unavailable"> => {
      if (!navigator.share) return "unavailable";
      try {
        await navigator.share(payload);
        return "shared";
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
        return "unavailable";
      }
    },
    []
  );

  const canShareFile = useCallback((file: File, payload: SharePayload): boolean => {
    if (!navigator.share || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [file], title: payload.title, text: payload.text, url: payload.url });
    } catch {
      return false;
    }
  }, []);

  const shareWithFile = useCallback(
    async (payload: ShareFilePayload): Promise<"shared" | "cancelled" | "unavailable"> => {
      if (!navigator.share) return "unavailable";
      try {
        const shareData: ShareData = {
          files: [payload.file],
          title: payload.title,
          text: payload.text,
          url: payload.url,
        };
        if (navigator.canShare && !navigator.canShare(shareData)) return "unavailable";
        await navigator.share(shareData);
        return "shared";
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
        return "unavailable";
      }
    },
    []
  );

  return { canShare, share, canShareFile, shareWithFile };
}
