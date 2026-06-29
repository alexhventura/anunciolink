import { useState } from "react";
import { motion } from "motion/react";
import { Check, Lightbulb, MessageCircle, Share2, Zap } from "lucide-react";
import type { AdFormState } from "../hooks/useAdForm";
import type { AdData } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdProductThumb } from "./AdProductThumb";
import { AdShareTools } from "./AdShareTools";
import { AdStatsPanel } from "./AdStatsPanel";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { ActionButtonWithHint, FieldLabelWithHint } from "./HelpTooltip";
import { copyToClipboard } from "../lib/formatters";
import { buildWhatsAppShareMessage, buildWhatsAppShareUrl } from "../lib/whatsappShare";
import { useNativeShare } from "../hooks/useNativeShare";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";

interface SuccessViewProps {
  form: AdFormState;
  generatedLink: string;
  adsenseReady: boolean;
  imageStrippedWarning?: boolean;
  textOptimizedWarning?: boolean;
  audioStrippedWarning?: boolean;
  onBackToEdit: () => void;
  onResetHome: () => void;
}

const typeLabel = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
} as const;

export function SuccessView({
  form,
  generatedLink,
  adsenseReady,
  imageStrippedWarning,
  textOptimizedWarning,
  audioStrippedWarning,
  onBackToEdit,
  onResetHome,
}: SuccessViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const { canShare, share } = useNativeShare();

  const shareMessage = buildWhatsAppShareMessage(
    form.title,
    form.price,
    form.description,
    generatedLink
  );
  const whatsAppShareUrl = buildWhatsAppShareUrl(
    form.title,
    form.price,
    form.description,
    generatedLink
  );

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(shareMessage);
    if (ok) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const result = await share({
      title: `${form.title} — AnúncioLink`,
      text: shareMessage,
      url: generatedLink,
    });
    if (result === "shared") setShareStatus("Compartilhado!");
    else if (result === "cancelled") setShareStatus(null);
    else setShareStatus(null);
    if (result === "shared") {
      window.setTimeout(() => setShareStatus(null), 2500);
    }
  };

  const adSnapshot: AdData = {
    t: form.adType,
    title: form.title,
    price: form.price,
    billingType: form.billingType,
    desc: form.description,
    phone: form.phone,
    pix: form.pix || undefined,
    cardLink: form.cardLink || undefined,
    img: form.photoPreview || undefined,
    audio: form.audioDataUrl || undefined,
    couponCode: form.couponEnabled ? form.couponCode : undefined,
    couponPercent: form.couponEnabled ? form.couponPercent : undefined,
    timestamp: Date.now(),
    printMode: form.printMode,
  };

  return (
    <motion.div
      key="success-screen"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto space-y-10"
    >
      <div className="neo-card-white p-8 md:p-10 text-center space-y-8 no-print">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border-[3px] border-black bg-lime-300 neo-shadow">
          <Check className="h-8 w-8 text-black" strokeWidth={3} aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <div className="neo-hero-banner mx-auto max-w-sm !rotate-0">
            <h2 className="text-display text-2xl sm:text-3xl font-black uppercase flex items-center justify-center gap-2">
              <Zap className="h-7 w-7 fill-amber-500 stroke-black" strokeWidth={2.5} aria-hidden="true" />
              Anúncio publicado
            </h2>
          </div>
          <p className="text-sm font-bold text-black max-w-sm mx-auto">
            Divulgue com o card de texto pronto. Foto e áudio aparecem só na página do anúncio.
          </p>
        </div>

        {imageStrippedWarning && (
          <div
            role="alert"
            className="rounded-lg border-[3px] border-black bg-amber-400 px-4 py-3 text-xs font-bold text-black text-left neo-shadow-sm"
          >
            A foto foi omitida do link por limite de tamanho. Encurte o texto, remova o áudio ou gere novamente.
          </div>
        )}

        {audioStrippedWarning && (
          <div
            role="alert"
            className="rounded-lg border-[3px] border-black bg-amber-400 px-4 py-3 text-xs font-bold text-black text-left neo-shadow-sm"
          >
            O áudio foi omitido do link por limite de tamanho. Encurte a descrição ou grave um áudio mais breve.
          </div>
        )}

        {textOptimizedWarning && (
          <div
            role="status"
            className="rounded-lg border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-xs font-semibold text-zinc-700 text-left neo-shadow-sm"
          >
            Texto otimizado para caber no link do WhatsApp.
          </div>
        )}

        <div className="space-y-6 text-left">
          <div>
            <FieldLabelWithHint hint={TOOLTIP_COPY.nativeShare} className="mb-2">
              <span className="label-field">Mensagem para compartilhar</span>
            </FieldLabelWithHint>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 rounded-lg border-[3px] border-black bg-amber-50 p-3 neo-shadow-sm">
              <textarea
                id="generated-link-input"
                readOnly
                rows={5}
                value={shareMessage}
                className="input-field !shadow-none flex-1 !py-2.5 text-xs font-medium resize-none min-h-[120px]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                id="btn-copy-link-sucesso"
                aria-live="polite"
                className={`shrink-0 min-h-[52px] !w-auto !min-w-[120px] ${
                  linkCopied ? "btn-payment-pix-copied !min-h-[52px]" : "btn-accent !min-h-[52px]"
                }`}
              >
                {linkCopied ? "✓ Copiado" : "Copiar texto"}
              </button>
            </div>

            <aside
              role="note"
              aria-labelledby="link-shortener-tip-heading"
              className="mt-4 rounded-lg border-2 border-zinc-900 bg-amber-100 px-4 py-3.5 neo-shadow-sm"
            >
              <div className="flex gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-zinc-900 bg-lime-200 shadow-[2px_2px_0_0_#18181b]"
                  aria-hidden="true"
                >
                  <Lightbulb className="h-4 w-4 text-black" strokeWidth={2.5} />
                </span>
                <p
                  id="link-shortener-tip-heading"
                  className="text-xs font-medium text-zinc-800 leading-relaxed"
                >
                  <span className="mr-0.5" aria-hidden="true">
                    💡
                  </span>
                  <strong className="font-black text-black">Por que o link é grande?</strong> Para garantir que
                  suas fotos, áudio e cupons funcionem de forma 100% gratuita e sem cadastros, salvamos tudo direto
                  na URL. Se for divulgar no perfil do Instagram ou TikTok, sugerimos encurtar este link
                  gratuitamente no{" "}
                  <a
                    href="https://bitly.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-black underline decoration-amber-600 underline-offset-2 hover:text-amber-900"
                  >
                    bitly.com
                  </a>{" "}
                  ou{" "}
                  <a
                    href="https://tinyurl.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-black underline decoration-amber-600 underline-offset-2 hover:text-amber-900"
                  >
                    tinyurl.com
                  </a>{" "}
                  para deixá-lo compacto e elegante!
                </p>
              </div>
            </aside>
          </div>

          {canShare ? (
            <ActionButtonWithHint
              hint={TOOLTIP_COPY.nativeShare}
              hintVariant="on-dark"
              onClick={() => void handleNativeShare()}
              id="btn-native-share-success"
              className="btn-primary gap-2"
              aria-live="polite"
            >
              <Share2 className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              {shareStatus ?? "Divulgar anúncio"}
            </ActionButtonWithHint>
          ) : (
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-whatsapp-share-success"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              Compartilhar no WhatsApp
            </a>
          )}

          {canShare && (
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-whatsapp-share-fallback"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              Compartilhar no WhatsApp
            </a>
          )}

          <AdStatsPanel ad={adSnapshot} />

          <AdShareTools ad={adSnapshot} variant="create" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 border-t-[3px] border-black pt-8">
          <a
            href={generatedLink}
            target="_blank"
            rel="noopener noreferrer"
            id="link-preview-direct"
            className="btn-primary !text-sm"
          >
            Abrir anúncio
          </a>
          <button type="button" onClick={onBackToEdit} id="btn-edit-info" className="btn-accent !min-h-[64px]">
            Editar
          </button>
          <button type="button" onClick={onResetHome} id="btn-create-another-success" className="btn-ghost !min-h-[64px]">
            Novo anúncio
          </button>
        </div>
      </div>

      <div className="no-print max-w-lg mx-auto space-y-6">
        <AdSenseSlot slot="topo" ready={adsenseReady} />
        <AdBrandedSurface
          variant="create"
          className="neo-card-white overflow-hidden min-h-[380px]"
          contentClassName="flex flex-col flex-1"
        >
          <div className="px-6 pt-6 pb-4 text-center bg-white border-b-[3px] border-black">
            <AdProductThumb
              src={form.photoPreview}
              alt={form.title}
              type={form.adType}
              title={form.title}
              size="md"
              className="mx-auto"
            />
            {form.photoPreview && (
              <p className="text-xs font-medium text-zinc-500 mt-3">
                Foto otimizada automaticamente para o link.
              </p>
            )}
          </div>
          <div className="p-8 space-y-3 bg-amber-500 flex-1">
            <span className="chip !bg-black !text-amber-400">{typeLabel[form.adType]}</span>
            <h3 className="text-xl font-black text-black">{form.title}</h3>
            <p className="text-3xl font-black text-black bg-white border-[3px] border-black inline-block px-3 py-1 neo-shadow-sm">
              {form.price}
            </p>
            <p className="text-sm text-black/80 line-clamp-4 font-medium">{form.description}</p>
          </div>
        </AdBrandedSurface>
        <AdSenseSlot slot="meio" ready={adsenseReady} />
      </div>
    </motion.div>
  );
}
