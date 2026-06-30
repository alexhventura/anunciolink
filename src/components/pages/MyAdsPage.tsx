import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Link2, Share2, Trash2 } from "lucide-react";
import type { SavedAdEntry } from "../../lib/adHistory";
import type { ExportQrPreference } from "../../lib/exportQr";
import { copyToClipboard } from "../../lib/formatters";
import { buildNativeShareText } from "../../lib/shareLinks";
import { generateShareCardBlob, shareCardFilename } from "../../lib/shareImage";
import {
  resolveSavedAdForExport,
  savedAdHasPix,
} from "../../lib/savedAdExport";
import { useAdHistory } from "../../hooks/useAdHistory";
import { useNativeShare } from "../../hooks/useNativeShare";
import { DeleteAdConfirmDialog } from "../DeleteAdConfirmDialog";
import { ExportQrPicker } from "../ExportQrPicker";
import { HoverLabel } from "../HoverLabel";
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
  const [qrPreferenceById, setQrPreferenceById] = useState<Record<string, ExportQrPreference>>({});

  useEffect(() => {
    refresh();
  }, [refresh]);

  const exportDataById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveSavedAdForExport>>();
    for (const entry of items) {
      map.set(entry.id, resolveSavedAdForExport(entry));
    }
    return map;
  }, [items]);

  const getQrPreference = useCallback(
    (entry: SavedAdEntry): ExportQrPreference => {
      const pref = qrPreferenceById[entry.id] ?? "ad";
      if (pref === "pix" && !savedAdHasPix(entry)) return "ad";
      return pref;
    },
    [qrPreferenceById]
  );

  const setQrPreference = useCallback((entryId: string, value: ExportQrPreference) => {
    setQrPreferenceById((prev) => ({ ...prev, [entryId]: value }));
  }, []);

  const handleCopy = useCallback(async (entry: SavedAdEntry) => {
    const ok = await copyToClipboard(entry.url);
    if (ok) {
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleShare = useCallback(
    async (entry: SavedAdEntry) => {
      const ad = exportDataById.get(entry.id);
      if (!ad) return;

      setShareLoadingId(entry.id);
      try {
        const nativeText = buildNativeShareText({
          title: ad.title,
          price: ad.price,
          description: ad.desc,
        });
        const blob = await generateShareCardBlob(ad, entry.url, getQrPreference(entry));
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

        await handleCopy(entry);
      } finally {
        setShareLoadingId(null);
      }
    },
    [canShare, canShareFile, exportDataById, getQrPreference, handleCopy, share, shareWithFile]
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, remove]);

  return (
    <InstitutionalPageLayout
      title="Meus Anúncios"
      subtitle="Anúncios salvos neste navegador. Escolha o QR, visualize, compartilhe ou baixe JPG e PDF."
      adsenseReady={adsenseReady}
    >
      {items.length === 0 ? (
        <div className="my-ads-empty neo-card-white text-center">
          <p className="my-ads-empty__text">
            Você ainda não criou nenhum anúncio perpétuo neste navegador.
          </p>
          <HoverLabel label="Criar meu anúncio agora" className="hover-label-wrap--block">
            <button type="button" onClick={onCreateAd} className="btn-primary mt-6">
              Criar Meu Anúncio Agora
            </button>
          </HoverLabel>
        </div>
      ) : (
        <ul className="my-ads-list" role="list">
          {items.map((entry) => {
            const ad = exportDataById.get(entry.id)!;
            const qrPreference = getQrPreference(entry);

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

                <ExportQrPicker
                  id={`my-ads-qr-${entry.id}`}
                  compact
                  value={qrPreference}
                  onChange={(value) => setQrPreference(entry.id, value)}
                  hasPix={savedAdHasPix(entry)}
                />

                <div
                  className="my-ads-item__toolbar"
                  role="toolbar"
                  aria-label={`Ações para ${entry.title}`}
                >
                  <IconActionButton
                    icon={Eye}
                    label={`Visualizar anúncio ${entry.title}`}
                    onClick={() => onOpenAd(entry.url)}
                  />

                  <IconActionButton
                    icon={Share2}
                    label={`Compartilhar anúncio ${entry.title}`}
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
                    variant="accent"
                    onClick={() => void handleCopy(entry)}
                  />

                  <Suspense fallback={null}>
                    <AdExportButtons ad={ad} qrUrl={entry.url} qrPreference={qrPreference} />
                  </Suspense>

                  <IconActionButton
                    icon={Trash2}
                    label={`Excluir ${entry.title} da lista local`}
                    variant="danger"
                    onClick={() => setPendingDelete(entry)}
                  />
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
