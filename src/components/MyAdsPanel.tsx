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
    <section className="max-w-xl mx-auto w-full neo-card-white p-8" aria-labelledby="my-ads-heading">
      <div className="mb-6 border-b-[3px] border-black pb-4">
        <h2 id="my-ads-heading" className="text-display text-lg font-black uppercase">
          Meus anúncios
        </h2>
        <p className="mt-1 text-xs font-bold text-zinc-700">Salvos neste navegador</p>
      </div>

      <ul className="space-y-4" role="list">
        {items.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border-[3px] border-black bg-amber-100 p-5 min-h-[72px] neo-shadow-sm neo-interactive"
          >
            <div className="flex-1 min-w-0 text-left space-y-1">
              <span className="chip-accent text-[10px]">{typeLabel[entry.type]}</span>
              <p className="font-black text-black truncate">{entry.title}</p>
              <p className="text-lg font-black text-black">{entry.price}</p>
              <time className="text-[11px] font-bold text-zinc-600" dateTime={new Date(entry.createdAt).toISOString()}>
                {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
              </time>
            </div>

            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => handleCopy(entry)} className="btn-accent text-xs !py-2" aria-live="polite">
                {copiedId === entry.id ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={() => onOpenAd(entry.url)} className="btn-ghost text-xs !py-2">
                Abrir
              </button>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Excluir anúncio ${entry.title}`}
                className="rounded-lg border-[3px] border-black bg-red-400 px-3 py-2 text-xs font-black uppercase neo-shadow-sm neo-interactive min-h-[40px]"
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
