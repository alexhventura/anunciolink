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
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <div className="rounded-[40px] border border-zinc-100 bg-white p-6 md:p-8 text-center shadow-soft-premium space-y-6 no-print">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-3xl shadow-soft-premium" aria-hidden="true">
          🎉
        </div>

        <h2 className="font-display text-2xl font-extrabold text-zinc-950 md:text-3xl uppercase tracking-tight">
          Seu anúncio está pronto!
        </h2>
        <p className="text-sm text-zinc-600 font-semibold max-w-md mx-auto">
          Copie o link e compartilhe no WhatsApp ou Instagram.
        </p>

        {imageStrippedWarning && (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 text-left">
            A foto foi omitida do link porque a URL ficou grande demais. O anúncio funciona sem imagem na URL — considere encurtar o Pix ou a descrição e gerar novamente com foto.
          </div>
        )}

        <div className="space-y-5 text-left">
          <div>
            <label htmlFor="generated-link-input" className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
              Link do anúncio
            </label>
            <div className="flex items-center gap-2 bg-zinc-50 rounded-2xl p-2.5 border border-zinc-100">
              <input
                id="generated-link-input"
                type="text"
                readOnly
                value={generatedLink}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-zinc-700 focus:outline-none font-mono truncate font-bold"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                id="btn-copy-link-sucesso"
                aria-live="polite"
                className={`shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase transition-all shadow-soft-premium min-h-[44px] ${
                  linkCopied ? "bg-[#25D366] text-white" : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                }`}
              >
                {linkCopied ? "✓ Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Veja meu anúncio '${form.title}' no Anuncio Link: ${generatedLink}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-whatsapp-share-success"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 font-display text-sm font-black text-white uppercase tracking-wider hover:opacity-95 transition-all shadow-soft-green min-h-[56px]"
          >
            💬 Compartilhar no WhatsApp
          </a>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-blue-900 font-semibold">
              Cartaz com QR Code pronto para impressão em mural ou panfleto.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              id="btn-print-cartaz"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase px-5 py-3 rounded-xl shrink-0 transition-all min-h-[44px]"
            >
              Imprimir / PDF 📄
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-zinc-150 pt-8">
          <a
            href={generatedLink}
            target="_blank"
            rel="noopener noreferrer"
            id="link-preview-direct"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-6 py-3 text-xs font-black uppercase text-white hover:bg-black transition-all shadow-soft-premium min-h-[44px]"
          >
            👁️ Abrir anúncio
          </a>
          <button type="button" onClick={onBackToEdit} id="btn-edit-info" className="rounded-2xl border border-amber-200 bg-amber-500 px-6 py-3 text-xs font-black uppercase text-zinc-950 hover:bg-amber-400 transition-all min-h-[44px]">
            ✏️ Editar
          </button>
          <button type="button" onClick={onResetHome} id="btn-create-another-success" className="rounded-2xl border border-zinc-200 bg-zinc-100 px-6 py-3 text-xs font-black uppercase text-zinc-950 hover:bg-zinc-200 transition-all min-h-[44px]">
            ➕ Novo anúncio
          </button>
        </div>
      </div>

      <div className="print-container rounded-[32px] bg-white p-6 md:p-8 shadow-xl space-y-6 border-[6px] border-amber-600 text-left">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4 min-h-[64px]">
          <div>
            <span className="bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase block w-max mb-1">
              {form.adType === "venda" ? "🏷️ VENDA" : form.adType === "servico" ? "🛠️ SERVIÇO" : "💝 AJUDA"}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-zinc-950">{form.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Preço</span>
            <span className="text-lg md:text-xl font-mono font-black text-amber-600">
              {form.price}{form.billingType === "recorrente" ? " /mês" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center min-h-[224px]">
          {form.photoPreview && (
            <div className="md:col-span-2 w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex justify-center items-center h-56">
              <img src={form.photoPreview} alt={form.title} className="max-w-full max-h-full object-contain rounded-lg" width={320} height={224} />
            </div>
          )}
          <div className={`${form.photoPreview ? "md:col-span-1" : "md:col-span-3"} flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-4 bg-zinc-50/30 text-center space-y-2 min-h-[180px]`}>
            <QRCodeSVG value={qrCodeLink} size={130} level="M" includeMargin className="bg-white p-1 rounded-lg" />
            <span className="text-[9px] font-bold text-zinc-950 uppercase font-mono">Escaneie para ver o anúncio</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-zinc-800 font-medium leading-relaxed whitespace-pre-wrap bg-zinc-50 p-5 rounded-2xl border border-zinc-100 min-h-[80px]">
          {form.description}
        </p>

        {(form.phone || form.pix) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.phone && (
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">WhatsApp</span>
                <span className="text-xs font-bold text-zinc-900 font-mono">{formatPhoneNumber(form.phone)}</span>
              </div>
            )}
            {form.pix && (
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Pix</span>
                <span className="text-[10px] font-mono text-zinc-600 block truncate">{form.pix}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-zinc-100 pt-4 flex justify-between items-center text-[9px] text-zinc-400 font-mono min-h-[32px]">
          <span>Gerado via {SITE_DOMAIN}</span>
          <span>Anuncio Link</span>
        </div>
      </div>

      <div className="no-print max-w-md mx-auto space-y-6">
        <AdSenseSlot slot="topo" ready={adsenseReady} />
        <div className="overflow-hidden rounded-[40px] bg-white shadow-soft-premium border-4 border-amber-600">
          <div className="p-6 pb-0">
            <div className="aspect-square w-full rounded-[32px] overflow-hidden bg-zinc-100 min-h-[280px]">
              {form.photoPreview ? (
                <AdImage src={form.photoPreview} alt={form.title} type={form.adType} title={form.title} printMode={form.printMode} />
              ) : (
                <ImageFallback title={form.title} type={form.adType} />
              )}
            </div>
          </div>
          <div className="p-6 space-y-3 min-h-[120px]">
            <h3 className="text-2xl font-extrabold text-zinc-950">{form.title}</h3>
            <p className="text-4xl font-black text-amber-600">{form.price}</p>
            <p className="text-sm text-zinc-600 line-clamp-4">{form.description}</p>
          </div>
        </div>
        <AdSenseSlot slot="meio" ready={adsenseReady} />
      </div>
    </motion.div>
  );
}
