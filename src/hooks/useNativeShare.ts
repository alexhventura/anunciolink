import { useCallback, useMemo } from "react";

interface SharePayload {
  title: string;
  text: string;
  url: string;
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

  return { canShare, share };
}
