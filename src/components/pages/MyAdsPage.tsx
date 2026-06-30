import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import type { SavedAdEntry } from "../../lib/adHistory";
import { copyToClipboard } from "../../lib/formatters";
import { buildNativeShareText } from "../../lib/shareLinks";
import { generateShareCardBlob, shareCardFilename } from "../../lib/shareImage";
import { isSavedAdExportable, resolveSavedAdData } from "../../lib/savedAdExport";
import { useAdHistory } from "../../hooks/useAdHistory";
import { useNativeShare } from "../../hooks/useNativeShare";
import { TOOLTIP_COPY } from "../../lib/tooltipCopy";
import { DeleteAdConfirmDialog } from "../DeleteAdConfirmDialog";
import { InstitutionalPageLayout } from "../InstitutionalPageLayout";
import { ActionButtonWithHint } from "../HelpTooltip";

const AdExportButtons = lazy(() =>
  import("../AdExportButtons").then((m) => ({ default: m.AdExportButtons }))
);

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
  const { canShare, canShareFile, share, shareWithFile } = useNativeShare();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareStatusId, setShareStatusId] = useState<string | null>(null);
  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedAdEntry | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const exportableById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveSavedAdData>>();
    for (const entry of items) {
      map.set(entry.id, resolveSavedAdData(entry));
    }
    return map;
  }, [items]);

  const handleCopy = useCallback(async (entry: SavedAdEntry) => {
    const ok = await copyToClipboard(entry.url);
    if (ok) {
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleShare = useCallback(
    async (entry: SavedAdEntry) => {
      const ad = exportableById.get(entry.id);
      if (!ad) {
        const ok = await copyToClipboard(entry.url);
        if (ok) {
          setCopiedId(entry.id);
          window.setTimeout(() => setCopiedId(null), 2000);
        }
        return;
      }

      setShareLoadingId(entry.id);
      try {
        const nativeText = buildNativeShareText({
          title: ad.title,
          price: ad.price,
          description: ad.desc,
        });
        const blob = await generateShareCardBlob(ad, entry.url);
        const file = new File([blob], shareCardFilename(ad), { type: "image/jpeg" });
        const title = `${ad.title} — AnúncioLink`;
        const filePayload = { file, title, text: nativeText, url: entry.url };

        if (canShareFile(file, filePayload)) {
          const result = await shareWithFile(filePayload);
          if (result === "shared") {
            setShareStatusId(entry.id);
            window.setTimeout(() => setShareStatusId(null), 2000);
          }
          return;
        }

        if (canShare) {
          const result = await share({ title, text: nativeText, url: entry.url });
          if (result === "shared") {
            setShareStatusId(entry.id);
            window.setTimeout(() => setShareStatusId(null), 2000);
          }
          return;
        }

        const ok = await copyToClipboard(entry.url);
        if (ok) {
          setCopiedId(entry.id);
          window.setTimeout(() => setCopiedId(null), 2000);
        }
      } finally {
        setShareLoadingId(null);
      }
    },
    [canShare, canShareFile, exportableById, share, shareWithFile]
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, remove]);

  return (
    <InstitutionalPageLayout
      title="Meus Anúncios"
      subtitle="Anúncios criados neste navegador — salvos localmente, sem servidor. Compartilhe, copie o link ou baixe PDF e JPG."
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
          {items.map((entry) => {
            const ad = exportableById.get(entry.id);
            const exportable = isSavedAdExportable(entry);

            return (
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
                  <ActionButtonWithHint
                    hint={TOOLTIP_COPY.nativeShare}
                    hintVariant="default"
                    onClick={() => void handleShare(entry)}
                    className="btn-ghost text-xs !py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
                    disabled={shareLoadingId === entry.id}
                    aria-label={`Compartilhar anúncio ${entry.title}`}
                  >
                    <Share2 className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    {shareStatusId === entry.id
                      ? "Enviado!"
                      : shareLoadingId === entry.id
                        ? "Preparando…"
                        : "Compartilhar"}
                  </ActionButtonWithHint>

                  <button
                    type="button"
                    onClick={() => void handleCopy(entry)}
                    className="btn-accent text-xs !py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
                    aria-live="polite"
                    aria-label={
                      copiedId === entry.id
                        ? `Link de ${entry.title} copiado`
                        : `Copiar link de ${entry.title}`
                    }
                  >
                    <Link2 className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                    {copiedId === entry.id ? "Copiado!" : "Copiar link"}
                  </button>

                  {exportable && ad ? (
                    <Suspense fallback={null}>
                      <AdExportButtons ad={ad} qrUrl={entry.url} compact />
                    </Suspense>
                  ) : (
                    <span
                      className="my-ads-item__export-hint text-[10px] font-semibold text-zinc-500 self-center px-1"
                      title="Anúncio com senha — abra e desbloqueie para exportar PDF ou JPG"
                    >
                      PDF/JPG ao abrir
                    </span>
                  )}

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
            );
          })}
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
