import { useState } from "react";
import { motion } from "motion/react";
import { Check, Zap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AdFormState } from "../hooks/useAdForm";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { ImageFallback } from "./ImageFallback";
import { formatPhoneNumber, copyToClipboard } from "../lib/formatters";
import { SITE_DOMAIN } from "../lib/constants";

interface SuccessViewProps {
  form: AdFormState;
  generatedLink: string;
  qrCodeLink: string;
  adsenseReady: boolean;
  imageStrippedWarning?: boolean;
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
  qrCodeLink,
  adsenseReady,
  imageStrippedWarning,
  onBackToEdit,
  onResetHome,
}: SuccessViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(generatedLink);
    if (ok) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    }
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
            Copie o link e compartilhe com seus compradores.
          </p>
        </div>

        {imageStrippedWarning && (
          <div
            role="alert"
            className="rounded-lg border-[3px] border-black bg-amber-400 px-4 py-3 text-xs font-bold text-black text-left neo-shadow-sm"
          >
            A foto foi omitida do link por limite de tamanho. Encurte o Pix ou a descrição e gere novamente com foto.
          </div>
        )}

        <div className="space-y-6 text-left">
          <div>
            <label htmlFor="generated-link-input" className="label-field">
              Link do anúncio
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 rounded-lg border-[3px] border-black bg-amber-50 p-3 neo-shadow-sm">
              <input
                id="generated-link-input"
                type="text"
                readOnly
                value={generatedLink}
                className="input-field !shadow-none flex-1 !py-2.5 text-xs font-mono truncate"
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
                {linkCopied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Veja meu anúncio "${form.title}" no Anuncio Link: ${generatedLink}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-whatsapp-share-success"
            className="btn-whatsapp"
          >
            Compartilhar no WhatsApp
          </a>

          <div className="rounded-lg border-[3px] border-black bg-amber-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 neo-shadow-sm">
            <p className="text-xs font-black uppercase text-black">Cartaz com QR Code para impressão</p>
            <button type="button" onClick={() => window.print()} id="btn-print-cartaz" className="btn-ghost text-xs !min-h-[48px]">
              Imprimir / PDF
            </button>
          </div>
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

      <div className="print-container neo-card-white p-8 space-y-6 text-left">
        <div className="flex items-start justify-between border-b-[3px] border-black pb-5 gap-4">
          <div>
            <span className="chip mb-2">{typeLabel[form.adType]}</span>
            <h1 className="text-xl font-black text-black">{form.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-black uppercase text-zinc-600">Preço</span>
            <p className="text-lg font-black text-black bg-amber-500 border-2 border-black px-2 py-0.5 mt-1 inline-block">
              {form.price}
              {form.billingType === "recorrente" ? " /mês" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center min-h-[200px]">
          {form.photoPreview && (
            <div className="md:col-span-2 rounded-lg border-[3px] border-black bg-white p-4 flex justify-center items-center h-52 neo-shadow-sm">
              <img
                src={form.photoPreview}
                alt={form.title}
                className="max-w-full max-h-full object-contain rounded-md"
                width={320}
                height={208}
              />
            </div>
          )}
          <div
            className={`${
              form.photoPreview ? "md:col-span-1" : "md:col-span-3"
            } flex flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-black p-4 bg-amber-50 text-center gap-2 min-h-[160px] neo-shadow-sm`}
          >
            <QRCodeSVG value={qrCodeLink} size={120} level="M" includeMargin className="rounded-md bg-white p-1 border-2 border-black" />
            <span className="text-[10px] font-black uppercase text-black">Escaneie o QR Code</span>
          </div>
        </div>

        <p className="text-sm text-black leading-relaxed whitespace-pre-wrap rounded-lg bg-amber-100 p-5 border-[3px] border-black font-medium">
          {form.description}
        </p>

        {(form.phone || form.pix) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.phone && (
              <div className="rounded-lg border-[3px] border-black p-4 bg-white neo-shadow-sm">
                <span className="text-[11px] font-black uppercase text-zinc-600">WhatsApp</span>
                <p className="text-sm font-bold text-black font-mono mt-1">{formatPhoneNumber(form.phone)}</p>
              </div>
            )}
            {form.pix && (
              <div className="rounded-lg border-[3px] border-black p-4 bg-white neo-shadow-sm">
                <span className="text-[11px] font-black uppercase text-zinc-600">Pix</span>
                <p className="text-[11px] font-mono text-black truncate mt-1">{form.pix}</p>
              </div>
            )}
          </div>
        )}

        <div className="border-t-[3px] border-black pt-4 flex justify-between text-[10px] font-bold text-zinc-600 uppercase">
          <span>{SITE_DOMAIN}</span>
          <span>Anuncio Link</span>
        </div>
      </div>

      <div className="no-print max-w-lg mx-auto space-y-6">
        <AdSenseSlot slot="topo" ready={adsenseReady} />
        <div className="neo-card-white overflow-hidden">
          <div className="bento-image !rounded-none !border-x-0 !border-t-0 !shadow-none !min-h-[280px]">
            {form.photoPreview ? (
              <AdImage src={form.photoPreview} alt={form.title} type={form.adType} title={form.title} printMode={form.printMode} />
            ) : (
              <ImageFallback title={form.title} type={form.adType} />
            )}
          </div>
          <div className="p-8 space-y-3 border-t-[3px] border-black bg-amber-500">
            <span className="chip !bg-black !text-amber-400">{typeLabel[form.adType]}</span>
            <h3 className="text-xl font-black text-black">{form.title}</h3>
            <p className="text-3xl font-black text-black bg-white border-[3px] border-black inline-block px-3 py-1 neo-shadow-sm">
              {form.price}
            </p>
            <p className="text-sm text-black/80 line-clamp-4 font-medium">{form.description}</p>
          </div>
        </div>
        <AdSenseSlot slot="meio" ready={adsenseReady} />
      </div>
    </motion.div>
  );
}
