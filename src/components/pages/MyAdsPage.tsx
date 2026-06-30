import { useCallback, useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import type { SavedAdEntry } from "../../lib/adHistory";
import { copyToClipboard } from "../../lib/formatters";
import { useAdHistory } from "../../hooks/useAdHistory";
import { useNativeShare } from "../../hooks/useNativeShare";
import { DeleteAdConfirmDialog } from "../DeleteAdConfirmDialog";
import { InstitutionalPageLayout } from "../InstitutionalPageLayout";

interface MyAdsPageProps {
  adsenseReady: boolean;
  onOpenAd: (url: string) => void;
  onCreateAd: () => void;
}

function formatAdHeadline(entry: SavedAdEntry): string {
  return `${entry.title.trim()} ${entry.price.trim()}`.toUpperCase();
}

export function MyAdsPage({ adsenseReady, onOpenAd, onCreateAd }: MyAdsPageProps) {
  const { items, remove, refresh } = useAdHistory();
  const { share } = useNativeShare();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareStatusId, setShareStatusId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedAdEntry | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCopy = useCallback(async (entry: SavedAdEntry) => {
    const ok = await copyToClipboard(entry.url);
    if (ok) {
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleShare = useCallback(
    async (entry: SavedAdEntry) => {
      const result = await share({
        title: entry.title,
        text: `${entry.title} — ${entry.price}`,
        url: entry.url,
      });

      if (result === "shared") {
        setShareStatusId(entry.id);
        window.setTimeout(() => setShareStatusId(null), 2000);
        return;
      }

      if (result === "unavailable") {
        const ok = await copyToClipboard(entry.url);
        if (ok) {
          setCopiedId(entry.id);
          window.setTimeout(() => setCopiedId(null), 2000);
        }
      }
    },
    [share]
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, remove]);

  return (
    <InstitutionalPageLayout
      title="Meus Anúncios"
      subtitle="Anúncios criados neste navegador — salvos localmente, sem servidor."
      adsenseReady={adsenseReady}
    >
      {items.length === 0 ? (
        <div className="my-ads-empty neo-card-white text-center">
          <p className="my-ads-empty__text">
            Você ainda não criou nenhum anúncio perpétuo neste navegador.
          </p>
          <button type="button" onClick={onCreateAd} className="btn-primary mt-6">
            Criar Meu Anúncio Agora
          </button>
        </div>
      ) : (
        <ul className="my-ads-list" role="list">
          {items.map((entry) => (
            <li key={entry.id} className="my-ads-item">
              <button
                type="button"
                className="my-ads-item__headline"
                onClick={() => onOpenAd(entry.url)}
                aria-label={`Abrir anúncio ${entry.title}`}
              >
                {formatAdHeadline(entry)}
              </button>

              <div className="my-ads-item__actions">
                <button
                  type="button"
                  onClick={() => void handleCopy(entry)}
                  className="btn-accent text-xs !py-2.5 min-h-[44px]"
                  aria-live="polite"
                  aria-label={
                    copiedId === entry.id
                      ? `Link de ${entry.title} copiado`
                      : `Copiar link de ${entry.title}`
                  }
                >
                  {copiedId === entry.id ? "Copiado!" : "Copiar Link"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShare(entry)}
                  className="btn-ghost text-xs !py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
                  aria-label={`Compartilhar anúncio ${entry.title}`}
                >
                  <Share2 className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  {shareStatusId === entry.id ? "Enviado!" : "Compartilhar"}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(entry)}
                  className="my-ads-item__delete"
                  aria-label={`Excluir ${entry.title} da lista local`}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteAdConfirmDialog
        open={pendingDelete !== null}
        adTitle={pendingDelete?.title ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </InstitutionalPageLayout>
  );
}
