import { useCallback, useEffect, useState } from "react";
import type { SavedAdEntry } from "../lib/adHistory";
import { deleteSavedAd, listSavedAds } from "../lib/adHistory";

export function useAdHistory() {
  const [items, setItems] = useState<SavedAdEntry[]>(() => listSavedAds());

  const refresh = useCallback(() => {
    setItems(listSavedAds());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "anunciolink_my_ads") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const remove = useCallback(
    (id: string) => {
      deleteSavedAd(id);
      refresh();
    },
    [refresh]
  );

  return { items, refresh, remove };
}
