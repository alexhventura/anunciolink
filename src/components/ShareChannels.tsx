import { useCallback, useMemo, useState } from "react";
import {
  Copy,
  Facebook,
  ImageIcon,
  Link2,
  Linkedin,
  MessageCircle,
  Send,
} from "lucide-react";
import type { AdData } from "../types/ad";
import { copyToClipboard } from "../lib/formatters";
import { buildQrShareUrl } from "../lib/qrShareUrl";
import {
  buildFacebookShareUrl,
  buildLinkedInShareUrl,
  buildShortShareText,
  buildSocialShareText,
  buildTelegramShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  type ShareContent,
} from "../lib/shareLinks";
import { generateShareCardBlob, shareCardFilename } from "../lib/shareImage";
import { useNativeShare } from "../hooks/useNativeShare";

interface ShareChannelsProps {
  ad: AdData;
  shareUrl: string;
  whatsAppMessage: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareChannels({ ad, shareUrl, whatsAppMessage }: ShareChannelsProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageSharing, setImageSharing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const { canShareFile, shareWithFile } = useNativeShare();

  const content: ShareContent = useMemo(
    () => ({
      title: ad.title,
      price: ad.price,
      description: ad.desc,
      url: shareUrl,
    }),
    [ad.desc, ad.price, ad.title, shareUrl]
  );

  const shortText = useMemo(() => buildShortShareText(content), [content]);
  const socialText = useMemo(() => buildSocialShareText(content), [content]);

  const channels = useMemo(
    () => [
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: buildWhatsAppShareUrl(ad.title, ad.price, ad.desc, shareUrl),
        icon: MessageCircle,
        className: "share-channel share-channel--whatsapp",
      },
      {
        id: "telegram",
        label: "Telegram",
        href: buildTelegramShareUrl(shareUrl, shortText),
        icon: Send,
        className: "share-channel share-channel--telegram",
      },
      {
        id: "facebook",
        label: "Facebook",
        href: buildFacebookShareUrl(shareUrl),
        icon: Facebook,
        className: "share-channel share-channel--facebook",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        href: buildLinkedInShareUrl(shareUrl),
        icon: Linkedin,
        className: "share-channel share-channel--linkedin",
      },
      {
        id: "twitter",
        label: "X / Twitter",
        href: buildTwitterShareUrl(shortText, shareUrl),
        icon: XIcon,
        className: "share-channel share-channel--twitter",
      },
    ],
    [ad.desc, ad.price, ad.title, shareUrl, shortText]
  );

  const handleCopyLink = useCallback(async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    }
  }, [shareUrl]);

  const handleShareImage = useCallback(async () => {
    setImageSharing(true);
    setStatus(null);
    try {
      const qrUrl = buildQrShareUrl(ad);
      const blob = await generateShareCardBlob(ad, qrUrl);
      const file = new File([blob], shareCardFilename(ad), { type: "image/png" });
      const payload = {
        file,
        title: `${ad.title} — AnúncioLink`,
        text: socialText,
        url: shareUrl,
      };

      if (canShareFile(file, payload)) {
        const result = await shareWithFile(payload);
        if (result === "shared") {
          setStatus("Imagem compartilhada!");
          window.setTimeout(() => setStatus(null), 3500);
        }
      } else {
        setStatus("Use “Baixar card” abaixo e anexe manualmente no app.");
        window.setTimeout(() => setStatus(null), 4500);
      }
    } catch {
      setStatus("Não foi possível gerar a imagem agora.");
      window.setTimeout(() => setStatus(null), 3500);
    } finally {
      setImageSharing(false);
    }
  }, [ad, canShareFile, shareUrl, shareWithFile, socialText]);

  return (
    <section className="share-channels" aria-labelledby="share-channels-heading">
      <header className="share-channels__header">
        <h2 id="share-channels-heading" className="share-channels__title">
          Compartilhar em
        </h2>
        <p className="share-channels__lead">
          WhatsApp, Telegram, redes sociais ou copie o link. A prévia usa Open Graph ao abrir a landing.
        </p>
      </header>

      <div className="share-channels__grid" role="list">
        {channels.map(({ id, label, href, icon: Icon, className }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            id={`btn-share-${id}`}
            className={className}
            aria-label={`Compartilhar no ${label} — abre em nova aba`}
          >
            {id === "twitter" ? (
              <Icon className="h-4 w-4 shrink-0" />
            ) : (
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            )}
            <span>{label}</span>
          </a>
        ))}
      </div>

      <div className="share-channels__utilities">
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="share-channel share-channel--utility"
          aria-live="polite"
          aria-label={linkCopied ? "Link copiado" : "Copiar link da landing page"}
        >
          <Link2 className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          {linkCopied ? "Link copiado" : "Copiar link"}
        </button>

        <button
          type="button"
          onClick={() => void handleShareImage()}
          disabled={imageSharing}
          className="share-channel share-channel--utility share-channel--image"
          aria-busy={imageSharing}
          aria-label="Compartilhar imagem do card nas redes"
        >
          <ImageIcon className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          {imageSharing ? "Gerando imagem…" : "Compartilhar imagem"}
        </button>
      </div>

      <details className="share-channels__message">
        <summary className="share-channels__message-toggle">
          <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
          Ver texto para colar manualmente
        </summary>
        <textarea
          readOnly
          rows={5}
          value={whatsAppMessage}
          className="share-channels__message-field input-field !shadow-none text-xs font-medium resize-none min-h-[100px] mt-3"
          aria-label="Texto formatado para compartilhar"
        />
      </details>

      {status && (
        <p className="share-channels__status" role="status">
          {status}
        </p>
      )}
    </section>
  );
}
