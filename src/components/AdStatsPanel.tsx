import { useCallback, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import type { AdData } from "../types/ad";
import { fetchAdViewStats } from "../lib/adAnalytics";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { HelpTooltip } from "./HelpTooltip";

interface AdStatsPanelProps {
  ad: AdData;
}

export function AdStatsPanel({ ad }: AdStatsPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [views, setViews] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const stats = await fetchAdViewStats(ad);
      setViews(stats.views);
    } catch {
      setError(true);
      setViews(null);
    } finally {
      setLoading(false);
    }
  }, [ad]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && views === null) void loadStats();
  };

  return (
    <div className="rounded-lg border-2 border-zinc-900 bg-white shadow-[3px_3px_0_0_#18181b] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="inline-flex items-center gap-2 min-w-0">
          <BarChart3 className="h-4 w-4 text-black shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <span className="text-sm font-bold text-black">Ver estatísticas de acessos</span>
          <HelpTooltip text={TOOLTIP_COPY.adStats} placement="top" />
        </span>
        <button
          type="button"
          id="btn-ad-stats-toggle"
          onClick={handleToggle}
          aria-expanded={open}
          className="text-xs font-bold text-zinc-500 uppercase shrink-0 px-2 py-1 rounded-md hover:bg-amber-50 transition-colors"
        >
          {open ? "Fechar" : "Abrir"}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t-2 border-zinc-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm font-medium text-zinc-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Carregando visualizações…
            </div>
          ) : error ? (
            <p className="text-xs font-medium text-zinc-600 py-4 text-center">
              Não foi possível carregar agora. Tente novamente em instantes.
            </p>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-4xl font-black text-black tabular-nums">{views ?? 0}</p>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                {views === 1 ? "visualização" : "visualizações"} no link
              </p>
              <button
                type="button"
                onClick={() => void loadStats()}
                id="btn-ad-stats-refresh"
                className="text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900"
              >
                Atualizar contagem
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
