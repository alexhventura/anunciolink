import { useCallback, useState } from "react";
import { Printer } from "lucide-react";
import type { SavedAdEntry } from "../lib/adHistory";
import { isLockedPayload } from "../lib/adLock";
import { AdSerializer } from "../lib/adSerializer";
import { extractPayloadFromAdUrl } from "../lib/adRoutes";
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
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [printErrorId, setPrintErrorId] = useState<string | null>(null);

  const handlePrint = useCallback(async (entry: SavedAdEntry) => {
    if (printingId) return;
    setPrintingId(entry.id);
    setPrintErrorId(null);

    try {
      const payload = extractPayloadFromAdUrl(entry.url);
      if (!payload) {
        throw new Error("Não foi possível ler os dados deste anúncio.");
      }

      if (isLockedPayload(payload)) {
        throw new Error("Este anúncio está protegido por senha. Abra o link e desbloqueie antes de imprimir.");
      }

      const ad = AdSerializer.decode(payload);
      if (!ad) {
        throw new Error("Anúncio inválido ou corrompido.");
      }

      const qrUrl = AdSerializer.buildQrUrl(ad);
      if (!AdSerializer.isQrUrlSafe(qrUrl)) {
        throw new Error("Anúncio muito grande para gerar o cartaz com QR Code.");
      }

      const { printA4CardPdf } = await import("../lib/a4CardPdf");
      await printA4CardPdf(ad, qrUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível imprimir o cartaz.";
      setPrintErrorId(entry.id);
      window.setTimeout(() => setPrintErrorId((current) => (current === entry.id ? null : current)), 4000);
      console.error(message);
    } finally {
      setPrintingId(null);
    }
  }, [printingId]);

  if (items.length === 0) return null;

  const handleCopy = async (entry: SavedAdEntry) => {
    const ok = await copyToClipboard(entry.url);
    if (ok) {
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto neo-card-white p-5 sm:p-8" aria-labelledby="my-ads-heading">
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

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopy(entry)}
                className="btn-accent text-xs !py-2"
                aria-live="polite"
                aria-label={
                  copiedId === entry.id
                    ? `Link de ${entry.title} copiado`
                    : `Copiar link do anúncio ${entry.title}`
                }
              >
                {copiedId === entry.id ? "Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={() => onOpenAd(entry.url)}
                className="btn-ghost text-xs !py-2"
                aria-label={`Abrir anúncio ${entry.title}`}
              >
                Abrir
              </button>
              <button
                type="button"
                onClick={() => void handlePrint(entry)}
                disabled={printingId === entry.id}
                className="btn-ghost text-xs !py-2 inline-flex items-center gap-1.5 min-h-[40px]"
                aria-busy={printingId === entry.id}
                aria-label={
                  printingId === entry.id
                    ? `Preparando cartaz A4 de ${entry.title}`
                    : `Imprimir cartaz A4 de ${entry.title}`
                }
                title="Imprimir cartaz A4 (PDF)"
              >
                <Printer className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                {printingId === entry.id ? "…" : "Imprimir"}
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
            {printErrorId === entry.id ? (
              <p className="text-xs font-bold text-red-700 sm:col-span-2" role="alert">
                Não foi possível gerar o cartaz. Tente abrir o anúncio e imprimir de lá.
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
