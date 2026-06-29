import type { AdData } from "../types/ad";

const COUNTAPI_NAMESPACE = "anunciolink";

/** ID estável para analytics — derivado do timestamp e título */
export function getAdAnalyticsId(ad: AdData): string {
  const slug = ad.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${ad.timestamp}-${slug || "ad"}`;
}

function getIngestUrl(adId: string): string | null {
  const custom = import.meta.env.VITE_ANALYTICS_INGEST_URL?.trim();
  if (custom) return custom.replace("{id}", encodeURIComponent(adId));
  return `https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${encodeURIComponent(adId)}`;
}

function getStatsUrl(adId: string): string | null {
  const custom = import.meta.env.VITE_ANALYTICS_STATS_URL?.trim();
  if (custom) return custom.replace("{id}", encodeURIComponent(adId));
  return `https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${encodeURIComponent(adId)}`;
}

/** Dispara pageview anônimo — falha silenciosa para não afetar UX */
export function trackAdPageView(ad: AdData): void {
  const adId = getAdAnalyticsId(ad);
  const url = getIngestUrl(adId);
  if (!url) return;

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
      return;
    }
    void fetch(url, { method: "GET", mode: "no-cors", keepalive: true });
  } catch {
    /* analytics opcional */
  }
}

export interface AdViewStats {
  views: number;
  adId: string;
}

/** Busca contagem pública de visualizações */
export async function fetchAdViewStats(ad: AdData): Promise<AdViewStats> {
  const adId = getAdAnalyticsId(ad);
  const url = getStatsUrl(adId);
  if (!url) return { views: 0, adId };

  try {
    const res = await fetch(url);
    if (!res.ok) return { views: 0, adId };
    const data = (await res.json()) as { value?: number };
    return { views: typeof data.value === "number" ? data.value : 0, adId };
  } catch {
    return { views: 0, adId };
  }
}
