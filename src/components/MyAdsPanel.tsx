import { useState } from "react";
import type { SavedAdEntry } from "../lib/adHistory";
import { copyToClipboard } from "../lib/formatters";
import { useAdHistory } from "../hooks/useAdHistory";

interface MyAdsPanelProps {
  onOpenAd: (url: string) => void;
}

const typeLabel: Record<SavedAdEntry["type"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

export function MyAdsPanel({ onOpenAd }: MyAdsPanelProps) {
  const { items, remove } = useAdHistory();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleCopy = async (entry: SavedAdEntry) => {
    const ok = await copyToClipboard(entry.url);
    if (ok) {
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section className="max-w-xl mx-auto w-full bento p-8" aria-labelledby="my-ads-heading">
      <div className="mb-6 flex items-end justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 id="my-ads-heading" className="text-display text-base font-bold">
            Meus anúncios
          </h2>
          <p className="mt-1 text-xs text-zinc-500 font-normal">Salvos neste dispositivo</p>
        </div>
      </div>

      <ul className="space-y-3" role="list">
        {items.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-5 min-h-[72px]"
          >
            <div className="flex-1 min-w-0 text-left space-y-1">
              <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
                {typeLabel[entry.type]}
              </span>
              <p className="font-semibold text-zinc-950 truncate">{entry.title}</p>
              <p className="text-sm font-bold text-amber-600">{entry.price}</p>
              <time className="text-[11px] text-zinc-400" dateTime={new Date(entry.createdAt).toISOString()}>
                {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
              </time>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleCopy(entry)}
                className="btn-accent text-xs min-h-[40px]"
                aria-live="polite"
              >
                {copiedId === entry.id ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={() => onOpenAd(entry.url)} className="btn-ghost text-xs min-h-[40px]">
                Abrir
              </button>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Excluir anúncio ${entry.title}`}
                className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors duration-200 min-h-[40px]"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
