import { useCallback, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { AdFormState } from "../hooks/useAdForm";
import { ImageFallback } from "./ImageFallback";
import { AdImage } from "./AdImage";
import { MyAdsPanel } from "./MyAdsPanel";
import { formatBRL, formatPhoneNumber, isValidPaymentUrl } from "../lib/formatters";
import { validateImageFile, ImageCompressorError, compressImage } from "../lib/imageCompressor";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH, SITE_NAME } from "../lib/constants";

interface HomeViewProps {
  form: AdFormState;
  isSubmitting: boolean;
  onFieldChange: <K extends keyof AdFormState>(field: K, value: AdFormState[K]) => void;
  onPhotoChange: (file: File | null, preview: string) => void;
  onImageError: (error: { code: string; message: string } | null) => void;
  onSubmitError: (error: string | null) => void;
  onSubmit: (compressedImage?: string) => void;
  onOpenSavedAd: (url: string) => void;
}

export function HomeView({
  form,
  isSubmitting,
  onFieldChange,
  onPhotoChange,
  onImageError,
  onSubmitError,
  onSubmit,
  onOpenSavedAd,
}: HomeViewProps) {
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getPlaceholderTitle = () => {
    if (form.adType === "venda") return "ex: iPhone 13 Pro Max 128GB";
    if (form.adType === "servico") return "ex: Personal Trainer — Plano Mensal";
    return "ex: Vaquinha Solidária para o Abrigo 🐾";
  };

  const getPriceLabel = () => {
    if (form.adType === "venda") return "Preço do Produto";
    if (form.adType === "servico") return "Preço / Valor do Serviço";
    return "Valor Sugerido ou Meta";
  };

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file);
      if (validation) {
        onImageError(validation);
        return;
      }
      onImageError(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const localUrl = URL.createObjectURL(file);
      previewUrlRef.current = localUrl;
      onPhotoChange(file, localUrl);
    },
    [onImageError, onPhotoChange]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmitError(null);

    if (!form.title.trim() || !form.price.trim() || !form.description.trim()) {
      onSubmitError("Preencha título, preço e descrição.");
      return;
    }
    if (form.cardLink.trim() && !isValidPaymentUrl(form.cardLink)) {
      onSubmitError("Informe um link de pagamento válido (http ou https).");
      return;
    }

    let compressedImage: string | undefined;
    if (form.photoFile) {
      try {
        compressedImage = await compressImage(form.photoFile, form.printMode);
      } catch (err) {
        const message =
          err instanceof ImageCompressorError
            ? err.message
            : "Não foi possível processar a imagem. Tente outra foto.";
        onImageError({ code: "COMPRESS_FAILED", message });
        onSubmitError(message);
        return;
      }
    }

    onSubmit(compressedImage);
  };

  return (
    <motion.div
      key="home-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.15 }}
      className="space-y-12"
    >
      <div className="text-center max-w-2xl mx-auto space-y-5">
        <span className="inline-block bg-amber-50 text-amber-900 font-bold px-4 py-2 rounded-full border border-amber-100/50 shadow-inner-soft text-xs font-mono tracking-wider">
          ⚡ SEM CADASTRO • SEM LOGIN • 100% GRÁTIS
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl leading-tight">
          Crie seu anúncio em <span className="text-amber-600 underline decoration-amber-500/30 decoration-wavy underline-offset-8">segundos</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-600 leading-relaxed max-w-xl mx-auto font-medium">
          Preencha o mínimo, envie uma foto e gere um link compartilhável no {SITE_NAME}. Pix direto ou cartão — sem intermediação.
        </p>
      </div>

      <MyAdsPanel onOpenAd={onOpenSavedAd} />

      <div className="max-w-2xl mx-auto w-full">
        <div className="rounded-[40px] border border-zinc-100 bg-white p-6 md:p-8 shadow-soft-premium">
          <div className="mb-6 border-b border-zinc-100 pb-4 text-left">
            <h2 className="font-display text-xl font-extrabold text-zinc-950 uppercase tracking-tight">
              ✏️ Dados do anúncio
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Campos com * são obrigatórios.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left" noValidate>
            {form.submitError && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {form.submitError}
              </div>
            )}

            <fieldset>
              <legend className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2.5 font-mono">
                Tipo de Anúncio
              </legend>
              <div className="grid grid-cols-3 gap-3">
                {(["venda", "servico", "vaquinha"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    id={`select-${type}`}
                    aria-pressed={form.adType === type}
                    onClick={() => onFieldChange("adType", type)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer min-h-[88px] ${
                      form.adType === type
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-soft-premium"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-2xl mb-1.5" aria-hidden="true">
                      {type === "venda" ? "🏷️" : type === "servico" ? "🛠️" : "💝"}
                    </span>
                    <span className="text-xs font-bold uppercase">{type === "vaquinha" ? "Vaquinha" : type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2.5 font-mono">
                Modelo de Cobrança
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(["unico", "recorrente"] as const).map((billing) => (
                  <button
                    key={billing}
                    type="button"
                    id={`select-billing-${billing}`}
                    aria-pressed={form.billingType === billing}
                    onClick={() => onFieldChange("billingType", billing)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer min-h-[88px] ${
                      form.billingType === billing
                        ? "border-amber-600 bg-amber-500 text-zinc-950 shadow-soft-premium"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase">
                      {billing === "unico" ? "Valor Único" : "Recorrente"}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="title-input" className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider font-mono">
                  Título <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-mono font-bold" aria-live="polite">
                  {form.title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <input
                type="text"
                id="title-input"
                required
                maxLength={MAX_TITLE_LENGTH}
                value={form.title}
                onChange={(e) => onFieldChange("title", e.target.value)}
                placeholder={getPlaceholderTitle()}
                autoComplete="off"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 font-bold bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="price-input" className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
                {getPriceLabel()} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="price-input"
                required
                inputMode="numeric"
                value={form.price}
                onChange={(e) => onFieldChange("price", formatBRL(e.target.value))}
                placeholder="R$ 0,00"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 font-bold bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="desc-input" className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider font-mono">
                  Descrição <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-mono font-bold">{form.description.length}/{MAX_DESC_LENGTH}</span>
              </div>
              <textarea
                id="desc-input"
                required
                maxLength={MAX_DESC_LENGTH}
                rows={4}
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Informações principais sobre o produto ou serviço."
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 font-medium resize-y bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="phone-input" className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                id="phone-input"
                value={form.phone}
                onChange={(e) => onFieldChange("phone", formatPhoneNumber(e.target.value))}
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 font-mono bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="pix-input" className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider font-mono">
                  Pix Copia e Cola (opcional)
                </label>
                <span className="text-[10px] text-zinc-400 font-mono font-bold">{form.pix.length}/{MAX_PIX_LENGTH}</span>
              </div>
              <textarea
                id="pix-input"
                maxLength={MAX_PIX_LENGTH}
                rows={2}
                value={form.pix}
                onChange={(e) => onFieldChange("pix", e.target.value)}
                placeholder="Cole o código Pix completo..."
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-xs font-mono focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 resize-none bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="card-input" className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
                Link de pagamento — cartão (opcional)
              </label>
              <input
                type="url"
                id="card-input"
                value={form.cardLink}
                onChange={(e) => onFieldChange("cardLink", e.target.value)}
                placeholder="https://link.mercadopago.com.br/..."
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none text-zinc-950 font-mono bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="photo-upload-input" className="block text-xs font-extrabold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
                Foto (opcional)
              </label>
              {form.imageError && (
                <p role="alert" className="mb-2 text-xs font-semibold text-red-600">{form.imageError.message}</p>
              )}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                className={`relative flex flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition-all min-h-[160px] ${
                  isDragging ? "border-amber-500 bg-amber-50/50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="photo-upload-input"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-20"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                {form.photoPreview ? (
                  <div className="relative flex flex-col items-center space-y-2.5 z-10">
                    <div className="relative h-28 w-28 overflow-hidden rounded-[24px] border border-zinc-100 shadow-soft-premium">
                      <img src={form.photoPreview} alt="" className="h-full w-full object-cover" width={112} height={112} />
                      <button
                        type="button"
                        id="btn-remove-photo"
                        aria-label="Remover foto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                          previewUrlRef.current = null;
                          onPhotoChange(null, "");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="text-xs font-bold text-zinc-600">{form.photoFile?.name ?? "Foto selecionada"}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2.5 pointer-events-none">
                    <span className="text-2xl" aria-hidden="true">📸</span>
                    <p className="text-xs font-extrabold text-zinc-950 uppercase">Arraste ou clique para enviar</p>
                    <p className="text-[11px] text-zinc-500">JPG, PNG ou WebP — máx. 5 MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 p-4 bg-zinc-50/50 flex items-center justify-between gap-4">
              <div>
                <span id="print-mode-label" className="text-xs font-extrabold text-zinc-950 uppercase font-mono">
                  🖨️ Modo panfleto / QR Code
                </span>
                <p className="text-[10px] text-zinc-500 font-semibold">Imagem inteira, sem corte — ideal para impressão.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.printMode}
                aria-labelledby="print-mode-label"
                onClick={() => onFieldChange("printMode", !form.printMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  form.printMode ? "bg-amber-600" : "bg-zinc-200"
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${form.printMode ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="rounded-[32px] border border-zinc-100 bg-zinc-50 p-5 shadow-inner-soft">
              <h3 className="font-display font-extrabold text-zinc-950 text-xs uppercase tracking-wider mb-4 font-mono">
                👁️ Prévia
              </h3>
              <div className="rounded-[32px] border border-zinc-100 bg-white p-5 space-y-4 shadow-soft-premium">
                <div className="aspect-square w-full max-w-[240px] mx-auto bg-zinc-50 rounded-[28px] overflow-hidden border border-zinc-100/50 min-h-[240px]">
                  {form.photoPreview ? (
                    <AdImage src={form.photoPreview} alt={form.title || "Prévia do anúncio"} type={form.adType} title={form.title} printMode={form.printMode} />
                  ) : (
                    <ImageFallback title={form.title} type={form.adType} />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-amber-600 font-mono min-h-[24px]">
                    {form.price || "A definir"}{form.price && form.billingType === "recorrente" ? " /mês" : ""}
                  </p>
                  <h4 className="font-display font-extrabold text-zinc-950 text-base line-clamp-2 min-h-[28px]">{form.title || "Sem título"}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 min-h-[32px]">{form.description || "Descrição..."}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-generate"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 hover:bg-black disabled:opacity-60 py-4.5 font-display text-sm font-extrabold text-white uppercase tracking-wider transition-all active:scale-[0.99] shadow-soft-premium min-h-[56px]"
            >
              {isSubmitting ? "Gerando…" : "⚡ Gerar Meu Anúncio Grátis"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}