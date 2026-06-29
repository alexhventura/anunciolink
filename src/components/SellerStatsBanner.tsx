import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import type { AdData } from "../types/ad";
import { fetchAdViewStats } from "../lib/adAnalytics";
import { isAdOwner } from "../lib/adOwnership";

interface SellerStatsBannerProps {
  ad: AdData;
}

/** Painel flutuante — visível apenas para o criador no mesmo dispositivo */
export function SellerStatsBanner({ ad }: SellerStatsBannerProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [views, setViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsOwner(isAdOwner(ad));
  }, [ad]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await fetchAdViewStats(ad);
      setViews(stats.views);
    } catch {
      setViews(0);
    } finally {
      setLoading(false);
    }
  }, [ad]);

  useEffect(() => {
    if (isOwner) void loadStats();
  }, [isOwner, loadStats]);

  if (!isOwner) return null;

  return (
    <div
      className="seller-stats-banner no-print"
      role="status"
      aria-live="polite"
    >
      <div className="seller-stats-banner__inner">
        <BarChart3 className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.5} aria-hidden="true" />
        <span className="text-xs sm:text-sm font-bold text-white">
          Painel do Vendedor:
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-300" aria-hidden="true" />
        ) : (
          <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
            {views ?? 0} {views === 1 ? "visualização" : "visualizações"}
          </span>
        )}
        <button
          type="button"
          onClick={() => void loadStats()}
          id="btn-seller-stats-refresh"
          disabled={loading}
          className="text-[10px] font-bold uppercase text-white/80 underline underline-offset-2 hover:text-white disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>
    </div>
  );
}
