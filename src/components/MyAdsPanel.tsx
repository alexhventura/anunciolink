import { useState } from "react";
import type { SavedAdEntry } from "../lib/adHistory";
import { copyToClipboard } from "../lib/formatters";
import { useAdHistory } from "../hooks/useAdHistory";

interface MyAdsPanelProps {
  onOpenAd: (url: string) => void;
}

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

  const typeLabel = (t: SavedAdEntry["type"]) =>
    t === "venda" ? "🏷️ Venda" : t === "servico" ? "🛠️ Serviço" : "💝 Vaquinha";

  return (
    <section
      className="max-w-2xl mx-auto w-full rounded-[32px] border border-zinc-100 bg-white p-6 shadow-soft-premium"
      aria-labelledby="my-ads-heading"
    >
      <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
        <h2 id="my-ads-heading" className="font-display text-lg font-extrabold text-zinc-950 uppercase tracking-tight">
          📂 Meus Anúncios
        </h2>
        <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase">
          Salvo neste dispositivo
        </span>
      </div>

      <p className="mb-4 text-xs text-zinc-500 font-medium">
        Histórico local no seu navegador — privado, sem servidor, custo zero.
      </p>

      <ul className="space-y-3" role="list">
        {items.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 min-h-[72px]"
          >
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-bold text-amber-700 uppercase font-mono">{typeLabel(entry.type)}</span>
              <p className="font-extrabold text-zinc-950 truncate">{entry.title}</p>
              <p className="text-sm font-black text-amber-600 font-mono">{entry.price}</p>
              <time className="text-[10px] text-zinc-400 font-mono" dateTime={new Date(entry.createdAt).toISOString()}>
                {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
              </time>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleCopy(entry)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-[10px] font-black uppercase text-zinc-950 hover:bg-amber-400 transition-all min-h-[40px]"
                aria-live="polite"
              >
                {copiedId === entry.id ? "✓ Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={() => onOpenAd(entry.url)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-[10px] font-black uppercase text-zinc-950 hover:bg-zinc-100 transition-all min-h-[40px]"
              >
                Abrir
              </button>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Excluir anúncio ${entry.title}`}
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-100 transition-all min-h-[40px]"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
