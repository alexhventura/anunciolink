import { useCallback, useMemo, useState } from "react";
import { ImageIcon, Link2, Printer, Share2 } from "lucide-react";
import type { AdData } from "../types/ad";
import { copyToClipboard } from "../lib/formatters";
import { buildQrShareUrl } from "../lib/qrShareUrl";
import { buildNativeShareText } from "../lib/shareLinks";
import { exportJpgCard, generateShareCardBlob, shareCardFilename } from "../lib/shareImage";
import { printA4CardPdf } from "../lib/a4CardPdf";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { useNativeShare } from "../hooks/useNativeShare";
import { ActionButtonWithHint } from "./HelpTooltip";

interface ShareChannelsProps {
  ad: AdData;
  shareUrl: string;
}

export function ShareChannels({ ad, shareUrl }: ShareChannelsProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [jpgLoading, setJpgLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { canShare, canShareFile, share, shareWithFile } = useNativeShare();

  const qrUrl = useMemo(() => shareUrl || buildQrShareUrl(ad), [ad, shareUrl]);

  const nativeText = useMemo(
    () => buildNativeShareText({ title: ad.title, price: ad.price, description: ad.desc }),
    [ad.desc, ad.price, ad.title]
  );

  const showStatus = useCallback((message: string, ms = 3500) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), ms);
  }, []);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    setSharing(true);
    setError(null);
    setStatus(null);

    try {
      const blob = await generateShareCardBlob(ad, qrUrl);
      const file = new File([blob], shareCardFilename(ad), { type: "image/jpeg" });
      const title = `${ad.title} — AnúncioLink`;
      const filePayload = { file, title, text: nativeText, url: shareUrl };

      if (canShareFile(file, filePayload)) {
        const result = await shareWithFile(filePayload);
        if (result === "shared") showStatus("Compartilhado!");
        return;
      }

      if (canShare) {
        const result = await share({ title, text: nativeText, url: shareUrl });
        if (result === "shared") showStatus("Compartilhado!");
        return;
      }

      showStatus("Use os botões JPG ou Copiar link neste dispositivo.", 4500);
    } catch {
      setError("Não foi possível preparar o compartilhamento.");
    } finally {
      setSharing(false);
    }
  }, [ad, canShare, canShareFile, nativeText, qrUrl, share, shareUrl, shareWithFile, showStatus]);

  const handlePdf = useCallback(async () => {
    if (!qrUrl.trim() || pdfLoading) return;
    setPdfLoading(true);
    setError(null);
    try {
      await printA4CardPdf(ad, qrUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível gerar o PDF.";
      setError(message);
    } finally {
      setPdfLoading(false);
    }
  }, [ad, pdfLoading, qrUrl]);

  const handleJpg = useCallback(async () => {
    if (jpgLoading) return;
    setJpgLoading(true);
    setError(null);
    try {
      await exportJpgCard(ad, qrUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível gerar o JPG.";
      setError(message);
    } finally {
      setJpgLoading(false);
    }
  }, [ad, jpgLoading, qrUrl]);

  return (
    <section className="share-channels" aria-labelledby="share-channels-heading">
      <header className="share-channels__header">
        <h2 id="share-channels-heading" className="share-channels__title">
          Divulgue seu anúncio
        </h2>
        <p className="share-channels__lead">
          Compartilhe a imagem com o link, copie só o endereço ou baixe PDF e JPG para impressão.
        </p>
      </header>

      <div className="share-channels__grid share-channels__grid--actions" role="list">
        <ActionButtonWithHint
          hint={TOOLTIP_COPY.nativeShare}
          hintVariant="on-dark"
          hintLayout="below"
          onClick={() => void handleNativeShare()}
          disabled={sharing}
          id="btn-native-share"
          className="share-channel share-channel--primary"
          aria-busy={sharing}
          aria-label="Compartilhar imagem e link pelo menu do celular"
        >
          <Share2 className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          {sharing ? "Preparando…" : "Compartilhar"}
        </ActionButtonWithHint>

        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="share-channel share-channel--utility"
          aria-live="polite"
          aria-label={linkCopied ? "Link copiado" : "Copiar link do anúncio"}
        >
          <Link2 className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          {linkCopied ? "Link copiado" : "Copiar link"}
        </button>

        <ActionButtonWithHint
          hint={TOOLTIP_COPY.printPoster}
          hintVariant="default"
          hintLayout="below"
          onClick={() => void handlePdf()}
          disabled={!qrUrl.trim() || pdfLoading}
          id="btn-export-pdf"
          className="share-channel share-channel--utility"
          aria-busy={pdfLoading}
          aria-label="Baixar cartaz A4 em PDF e abrir para impressão"
        >
          <Printer className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
          {pdfLoading ? "Gerando…" : "PDF"}
        </ActionButtonWithHint>

        <ActionButtonWithHint
          hint={TOOLTIP_COPY.socialCard}
          hintVariant="default"
          hintLayout="below"
          onClick={() => void handleJpg()}
          disabled={jpgLoading}
          id="btn-export-jpg"
          className="share-channel share-channel--utility"
          aria-busy={jpgLoading}
          aria-label="Baixar card quadrado em JPG e abrir para impressão"
        >
          <ImageIcon className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          {jpgLoading ? "Gerando…" : "JPG"}
        </ActionButtonWithHint>
      </div>

      {status && (
        <p className="share-channels__status" role="status">
          {status}
        </p>
      )}

      {error && (
        <p className="share-channels__status share-channels__status--error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
