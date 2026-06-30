import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link2, Share2, Trash2 } from "lucide-react";
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
import { IconActionButton } from "../IconActionButton";

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
          await shareWithFile(filePayload);
          return;
        }

        if (canShare) {
          await share({ title, text: nativeText, url: entry.url });
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

                <div
                  className="my-ads-item__toolbar"
                  role="toolbar"
                  aria-label={`Ações para ${entry.title}`}
                >
                  <IconActionButton
                    icon={Share2}
                    label={`Compartilhar anúncio ${entry.title}`}
                    hint={TOOLTIP_COPY.nativeShare}
                    onClick={() => void handleShare(entry)}
                    busy={shareLoadingId === entry.id}
                  />

                  <IconActionButton
                    icon={Link2}
                    label={
                      copiedId === entry.id
                        ? `Link de ${entry.title} copiado`
                        : `Copiar link de ${entry.title}`
                    }
                    hint="Copia somente o endereço do anúncio."
                    variant="accent"
                    onClick={() => void handleCopy(entry)}
                  />

                  {exportable && ad ? (
                    <Suspense fallback={null}>
                      <AdExportButtons ad={ad} qrUrl={entry.url} iconsOnly />
                    </Suspense>
                  ) : null}

                  <IconActionButton
                    icon={Trash2}
                    label={`Excluir ${entry.title} da lista local`}
                    hint="Remove este anúncio apenas do histórico deste navegador."
                    variant="danger"
                    onClick={() => setPendingDelete(entry)}
                  />
                </div>

                {!exportable ? (
                  <p className="my-ads-item__export-hint" role="note">
                    PDF e JPG disponíveis após abrir anúncios protegidos por senha.
                  </p>
                ) : null}
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
