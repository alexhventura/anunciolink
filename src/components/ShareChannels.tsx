import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, ImageIcon, Link2, Printer, Share2 } from "lucide-react";
import type { AdData } from "../types/ad";
import type { ExportQrPreference } from "../lib/exportQr";
import { hasPixQr } from "../lib/exportQr";
import { copyToClipboard } from "../lib/formatters";
import { buildQrShareUrl } from "../lib/qrShareUrl";
import { buildNativeShareText } from "../lib/shareLinks";
import { exportJpgCard, generateShareCardBlob, shareCardFilename } from "../lib/shareImage";
import { printA4CardPdf } from "../lib/a4CardPdf";
import { useNativeShare } from "../hooks/useNativeShare";
import { ExportQrPicker } from "./ExportQrPicker";
import { IconActionButton } from "./IconActionButton";

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
  const [qrPreference, setQrPreference] = useState<ExportQrPreference>("ad");
  const { canShare, canShareFile, share, shareWithFile } = useNativeShare();

  const qrUrl = useMemo(() => shareUrl || buildQrShareUrl(ad), [ad, shareUrl]);
  const pixAvailable = useMemo(() => hasPixQr(ad), [ad]);

  useEffect(() => {
    if (qrPreference === "pix" && !pixAvailable) setQrPreference("ad");
  }, [pixAvailable, qrPreference]);

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
      const blob = await generateShareCardBlob(ad, qrUrl, qrPreference);
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

      showStatus("Use JPG ou Copiar link neste dispositivo.", 4500);
    } catch {
      setError("Não foi possível preparar o compartilhamento.");
    } finally {
      setSharing(false);
    }
  }, [ad, canShare, canShareFile, nativeText, qrPreference, qrUrl, share, shareUrl, shareWithFile, showStatus]);

  const handlePdf = useCallback(async () => {
    if (!qrUrl.trim() || pdfLoading) return;
    setPdfLoading(true);
    setError(null);
    try {
      await printA4CardPdf(ad, qrUrl, qrPreference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o PDF.");
    } finally {
      setPdfLoading(false);
    }
  }, [ad, pdfLoading, qrPreference, qrUrl]);

  const handleJpg = useCallback(async () => {
    if (jpgLoading) return;
    setJpgLoading(true);
    setError(null);
    try {
      await exportJpgCard(ad, qrUrl, qrPreference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o JPG.");
    } finally {
      setJpgLoading(false);
    }
  }, [ad, jpgLoading, qrPreference, qrUrl]);

  return (
    <section className="share-channels" aria-labelledby="share-channels-heading">
      <header className="share-channels__header">
        <h2 id="share-channels-heading" className="share-channels__title">
          Divulgue seu anúncio
        </h2>
        <p className="share-channels__lead">
          Escolha o QR do cartaz, depois compartilhe, copie o link ou baixe JPG e PDF.
        </p>
      </header>

      <ExportQrPicker
        id="success-export-qr"
        value={qrPreference}
        onChange={setQrPreference}
        hasPix={pixAvailable}
      />

      <div className="share-toolbar" role="toolbar" aria-label="Ações de compartilhamento">
        <IconActionButton
          icon={Share2}
          label="Compartilhar imagem e link"
          variant="primary"
          onClick={() => void handleNativeShare()}
          busy={sharing}
          id="btn-native-share"
        />
        <IconActionButton
          icon={Link2}
          label={linkCopied ? "Link copiado" : "Copiar link do anúncio"}
          variant="accent"
          onClick={() => void handleCopyLink()}
        />
        <IconActionButton
          icon={Printer}
          label="Baixar cartaz A4 em PDF"
          onClick={() => void handlePdf()}
          disabled={!qrUrl.trim()}
          busy={pdfLoading}
          id="btn-export-pdf"
        />
        <IconActionButton
          icon={ImageIcon}
          label="Baixar cartaz A4 em JPG"
          onClick={() => void handleJpg()}
          busy={jpgLoading}
          id="btn-export-jpg"
        />
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
