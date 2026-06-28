import { useState } from "react";
import { motion } from "motion/react";
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
      <div className="bento p-8 md:p-10 text-center space-y-8 no-print">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-lg font-bold text-zinc-950">
          ✓
        </div>

        <div className="space-y-2">
          <h2 className="text-display text-2xl font-bold">Anúncio publicado</h2>
          <p className="text-sm text-zinc-500 font-normal max-w-sm mx-auto">
            Copie o link e compartilhe com seus compradores.
          </p>
        </div>

        {imageStrippedWarning && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 text-left">
            A foto foi omitida do link por limite de tamanho. Encurte o Pix ou a descrição e gere novamente com foto.
          </div>
        )}

        <div className="space-y-6 text-left">
          <div>
            <label htmlFor="generated-link-input" className="label-field">Link do anúncio</label>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/80 p-2">
              <input
                id="generated-link-input"
                type="text"
                readOnly
                value={generatedLink}
                className="w-full bg-transparent px-2 py-1.5 text-xs text-zinc-600 focus:outline-none font-mono truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                id="btn-copy-link-sucesso"
                aria-live="polite"
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 min-h-[40px] ${
                  linkCopied ? "bg-[#25D366] text-white" : "btn-accent !py-2 !px-4"
                }`}
              >
                {linkCopied ? "Copiado" : "Copiar"}
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

          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-600 font-normal">Cartaz com QR Code para impressão</p>
            <button type="button" onClick={() => window.print()} id="btn-print-cartaz" className="btn-ghost text-xs">
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-zinc-100 pt-8">
          <a href={generatedLink} target="_blank" rel="noopener noreferrer" id="link-preview-direct" className="btn-primary text-xs !py-2.5">
            Abrir anúncio
          </a>
          <button type="button" onClick={onBackToEdit} id="btn-edit-info" className="btn-accent text-xs !py-2.5">
            Editar
          </button>
          <button type="button" onClick={onResetHome} id="btn-create-another-success" className="btn-ghost text-xs">
            Novo anúncio
          </button>
        </div>
      </div>

      <div className="print-container bento p-8 space-y-6 text-left">
        <div className="flex items-start justify-between border-b border-zinc-100 pb-5 gap-4">
          <div>
            <span className="chip mb-2">{typeLabel[form.adType]}</span>
            <h1 className="text-xl font-bold text-zinc-950">{form.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-medium text-zinc-400 uppercase">Preço</span>
            <p className="text-lg font-bold text-amber-600">
              {form.price}{form.billingType === "recorrente" ? " /mês" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center min-h-[200px]">
          {form.photoPreview && (
            <div className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex justify-center items-center h-52">
              <img src={form.photoPreview} alt={form.title} className="max-w-full max-h-full object-contain rounded-md" width={320} height={208} />
            </div>
          )}
          <div className={`${form.photoPreview ? "md:col-span-1" : "md:col-span-3"} flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 p-4 bg-zinc-50/50 text-center gap-2 min-h-[160px]`}>
            <QRCodeSVG value={qrCodeLink} size={120} level="M" includeMargin className="rounded-md bg-white p-1" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Escaneie o QR Code</span>
          </div>
        </div>

        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap rounded-lg bg-zinc-50 p-5 border border-zinc-100">
          {form.description}
        </p>

        {(form.phone || form.pix) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.phone && (
              <div className="rounded-lg border border-zinc-200 p-4">
                <span className="text-[11px] font-medium text-zinc-400 uppercase">WhatsApp</span>
                <p className="text-sm font-medium text-zinc-900 font-mono mt-1">{formatPhoneNumber(form.phone)}</p>
              </div>
            )}
            {form.pix && (
              <div className="rounded-lg border border-zinc-200 p-4">
                <span className="text-[11px] font-medium text-zinc-400 uppercase">Pix</span>
                <p className="text-[11px] font-mono text-zinc-600 truncate mt-1">{form.pix}</p>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-zinc-100 pt-4 flex justify-between text-[10px] text-zinc-400">
          <span>{SITE_DOMAIN}</span>
          <span>Anuncio Link</span>
        </div>
      </div>

      <div className="no-print max-w-lg mx-auto space-y-6">
        <AdSenseSlot slot="topo" ready={adsenseReady} />
        <div className="card overflow-hidden border border-zinc-200">
          <div className="bento-image !rounded-none !border-0 !min-h-[280px]">
            {form.photoPreview ? (
              <AdImage src={form.photoPreview} alt={form.title} type={form.adType} title={form.title} printMode={form.printMode} />
            ) : (
              <ImageFallback title={form.title} type={form.adType} />
            )}
          </div>
          <div className="p-8 space-y-3">
            <h3 className="text-xl font-bold text-zinc-950">{form.title}</h3>
            <p className="text-3xl font-bold text-amber-600">{form.price}</p>
            <p className="text-sm text-zinc-500 line-clamp-4 font-normal">{form.description}</p>
          </div>
        </div>
        <AdSenseSlot slot="meio" ready={adsenseReady} />
      </div>
    </motion.div>
  );
}
