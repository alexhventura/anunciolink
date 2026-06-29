import { useCallback, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { AdFormState } from "../hooks/useAdForm";
import type { AdImagePayload } from "../types/ad";
import { AdProductThumb } from "./AdProductThumb";
import { MyAdsPanel } from "./MyAdsPanel";
import { formatBRL, formatPhoneNumber, isValidPaymentUrl } from "../lib/formatters";
import { validateImageFile, ImageCompressorError, compressImageOnUpload } from "../lib/imageCompressor";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH, SITE_NAME } from "../lib/constants";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint, FieldLabelWithHint, FieldLegendWithHint } from "./HelpTooltip";

interface HomeViewProps {
  form: AdFormState;
  isSubmitting: boolean;
  onFieldChange: <K extends keyof AdFormState>(field: K, value: AdFormState[K]) => void;
  onPhotoChange: (file: File | null, preview: string) => void;
  onImageError: (error: { code: string; message: string } | null) => void;
  onSubmitError: (error: string | null) => void;
  onSubmit: (payload?: AdImagePayload) => void;
  onOpenSavedAd: (url: string) => void;
}

const AD_TYPES = [
  { id: "venda" as const, label: "Venda" },
  { id: "servico" as const, label: "Serviço" },
  { id: "vaquinha" as const, label: "Vaquinha" },
];

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
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const getPlaceholderTitle = () => {
    if (form.adType === "venda") return "iPhone 13 Pro Max 128GB";
    if (form.adType === "servico") return "Personal Trainer — plano mensal";
    return "Vaquinha solidária para abrigo de animais";
  };

  const getPriceLabel = () => {
    if (form.adType === "venda") return "Preço do produto";
    if (form.adType === "servico") return "Valor do serviço";
    return "Meta ou valor sugerido";
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImageFile(file);
      if (validation) {
        onImageError(validation);
        return;
      }

      onImageError(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setIsCompressingPhoto(true);
      try {
        const compressed = await compressImageOnUpload(file);
        onPhotoChange(file, compressed);
      } catch (err) {
        const message =
          err instanceof ImageCompressorError
            ? err.message
            : "Não foi possível processar a imagem. Tente outra foto.";
        onImageError({ code: "COMPRESS_FAILED", message });
      } finally {
        setIsCompressingPhoto(false);
      }
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

    let imagePayload: AdImagePayload | undefined;
    if (form.photoPreview) {
      imagePayload = { image: form.photoPreview };
    }

    onSubmit(imagePayload);
  };

  const segmentBase = "neo-segment";
  const segmentActive = "neo-segment-active";
  const segmentIdle = "neo-segment-idle";

  return (
    <motion.div
      key="home-screen"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-20"
    >
      {/* Hero */}
      <div className="text-center max-w-lg mx-auto space-y-6 px-2">
        <span className="chip-accent">Sem cadastro · 100% grátis</span>

        <div className="neo-hero-banner mx-auto max-w-md">
          <h1 className="text-display text-3xl sm:text-4xl font-black leading-[1.05] text-black uppercase">
            Anúncio pronto
            <br />
            <span className="text-white bg-black px-2 py-0.5 inline-block mt-1 -rotate-1">em segundos</span>
          </h1>
        </div>

        <p className="text-base font-semibold text-black max-w-md mx-auto leading-snug">
          Foto + Pix + link compartilhável.
          <span className="block text-sm font-medium text-zinc-700 mt-1">Rápido como raio — {SITE_NAME}.</span>
        </p>
      </div>

      <MyAdsPanel onOpenAd={onOpenSavedAd} />

      {/* Formulário */}
      <div className="max-w-xl mx-auto w-full">
        <div className="neo-card-white p-8 md:p-10">
          <header className="mb-10 pb-6 border-b-[3px] border-black">
            <h2 className="text-display text-xl font-black uppercase">Novo anúncio</h2>
            <p className="mt-2 text-sm font-bold text-zinc-700">Preencha e gere seu link *</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-9" noValidate>
            {form.submitError && (
              <div role="alert" className="rounded-lg border-[3px] border-black bg-red-400 px-4 py-3 text-sm font-bold text-black neo-shadow-sm">
                {form.submitError}
              </div>
            )}

            <fieldset className="space-y-3">
              <FieldLegendWithHint hint={TOOLTIP_COPY.adType}>Tipo de anúncio</FieldLegendWithHint>
              <div className="grid grid-cols-3 gap-3">
                {AD_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    id={`select-${id}`}
                    aria-pressed={form.adType === id}
                    onClick={() => onFieldChange("adType", id)}
                    className={`${segmentBase} ${form.adType === id ? segmentActive : segmentIdle}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <FieldLegendWithHint hint={TOOLTIP_COPY.billing}>Cobrança</FieldLegendWithHint>
              <div className="grid grid-cols-2 gap-3">
                {(["unico", "recorrente"] as const).map((billing) => (
                  <button
                    key={billing}
                    type="button"
                    id={`select-billing-${billing}`}
                    aria-pressed={form.billingType === billing}
                    onClick={() => onFieldChange("billingType", billing)}
                    className={`${segmentBase} ${
                      form.billingType === billing ? "neo-segment-amber" : segmentIdle
                    }`}
                  >
                    {billing === "unico" ? "Valor único" : "Recorrente"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex justify-between items-center mb-2">
                <FieldLabelWithHint htmlFor="title-input" hint={TOOLTIP_COPY.title}>
                  Título <span className="text-red-500">*</span>
                </FieldLabelWithHint>
                <span className="text-[11px] text-zinc-400 tabular-nums" aria-live="polite">
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
                className="input-field"
              />
            </div>

            <div>
              <FieldLabelWithHint htmlFor="price-input" hint={TOOLTIP_COPY.price} className="mb-2">
                {getPriceLabel()} <span className="text-red-500">*</span>
              </FieldLabelWithHint>
              <input
                type="text"
                id="price-input"
                required
                inputMode="numeric"
                value={form.price}
                onChange={(e) => onFieldChange("price", formatBRL(e.target.value))}
                placeholder="R$ 0,00"
                className="input-field font-semibold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <FieldLabelWithHint htmlFor="desc-input" hint={TOOLTIP_COPY.description}>
                  Descrição <span className="text-red-500">*</span>
                </FieldLabelWithHint>
                <span className="text-[11px] text-zinc-400 tabular-nums">
                  {form.description.length}/{MAX_DESC_LENGTH}
                </span>
              </div>
              <textarea
                id="desc-input"
                required
                maxLength={MAX_DESC_LENGTH}
                rows={5}
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Descreva o produto ou serviço com clareza."
                className="input-field resize-y min-h-[120px]"
              />
            </div>

            <div>
              <FieldLabelWithHint htmlFor="phone-input" hint={TOOLTIP_COPY.phone} className="mb-2">
                WhatsApp (opcional)
              </FieldLabelWithHint>
              <input
                type="tel"
                id="phone-input"
                value={form.phone}
                onChange={(e) => onFieldChange("phone", formatPhoneNumber(e.target.value))}
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                className="input-field font-mono text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <FieldLabelWithHint htmlFor="pix-input" hint={TOOLTIP_COPY.pix}>
                  Pix copia e cola (opcional)
                </FieldLabelWithHint>
                <span className="text-[11px] text-zinc-400 tabular-nums">{form.pix.length}/{MAX_PIX_LENGTH}</span>
              </div>
              <textarea
                id="pix-input"
                maxLength={MAX_PIX_LENGTH}
                rows={2}
                value={form.pix}
                onChange={(e) => onFieldChange("pix", e.target.value)}
                placeholder="Cole o código Pix completo"
                className="input-field font-mono text-xs resize-none"
              />
            </div>

            <div>
              <FieldLabelWithHint htmlFor="card-input" hint={TOOLTIP_COPY.cardLink} className="mb-2">
                Link de pagamento — cartão (opcional)
              </FieldLabelWithHint>
              <input
                type="url"
                id="card-input"
                value={form.cardLink}
                onChange={(e) => onFieldChange("cardLink", e.target.value)}
                placeholder="https://link.mercadopago.com.br/..."
                className="input-field font-mono text-sm"
              />
            </div>

            <div>
              <FieldLabelWithHint htmlFor="photo-upload-input" hint={TOOLTIP_COPY.photo} className="mb-2">
                Foto (opcional)
              </FieldLabelWithHint>
              {form.imageError && (
                <p role="alert" className="mb-3 text-xs font-medium text-red-600">{form.imageError.message}</p>
              )}

              {!form.photoPreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!isCompressingPhoto) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (isCompressingPhoto) return;
                  const file = e.dataTransfer.files?.[0];
                  if (file) void handleFile(file);
                }}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-900 p-10 text-center shadow-[3px_3px_0_0_#18181b] min-h-[140px] transition-all duration-150 ${
                  isCompressingPhoto
                    ? "bg-zinc-100 border-zinc-400 cursor-wait"
                    : isDragging
                      ? "bg-lime-200 border-lime-400"
                      : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="photo-upload-input"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isCompressingPhoto}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
                  <div className="pointer-events-none space-y-1">
                    {isCompressingPhoto ? (
                      <>
                        <p className="text-sm font-semibold text-zinc-700">Otimizando foto para o link…</p>
                        <p className="text-xs text-zinc-500">Redimensionando no seu aparelho</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-zinc-800">Arraste ou clique para enviar</p>
                        <p className="text-xs text-zinc-400">JPG, PNG ou WebP — máx. 5 MB · otimizado para WhatsApp</p>
                      </>
                    )}
                  </div>
              </div>
              ) : (
                <div className="space-y-4 rounded-lg border-2 border-zinc-900 bg-white p-6 shadow-[3px_3px_0_0_#18181b] text-center">
                  <AdProductThumb
                    src={form.photoPreview}
                    alt={form.title || "Foto do produto"}
                    type={form.adType}
                    title={form.title}
                    size="md"
                    className="mx-auto"
                  />
                  <p className="text-xs font-medium text-zinc-500">
                    Foto otimizada automaticamente para o link do WhatsApp.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="text-xs font-medium text-zinc-500 truncate max-w-[200px]">
                      {form.photoFile?.name ?? "Foto selecionada"}
                    </span>
                    <button
                      type="button"
                      id="btn-remove-photo"
                      aria-label="Remover foto"
                      onClick={() => {
                        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                        previewUrlRef.current = null;
                        onPhotoChange(null, "");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="shrink-0 rounded-md border-2 border-zinc-900 bg-white px-3 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_0_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#18181b] transition-all"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border-[3px] border-black bg-amber-100 p-5 flex items-center justify-between gap-4 neo-shadow-sm">
              <div>
                <FieldLabelWithHint
                  hint={TOOLTIP_COPY.printMode}
                  labelClassName="text-sm font-medium text-zinc-800 mb-0"
                >
                  <span id="print-mode-label">Modo panfleto / QR Code</span>
                </FieldLabelWithHint>
                <p className="text-xs text-zinc-500 mt-0.5 font-normal">Imagem inteira, ideal para impressão</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.printMode}
                aria-labelledby="print-mode-label"
                onClick={() => onFieldChange("printMode", !form.printMode)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-lg border-[3px] border-black transition-all duration-150 neo-shadow-sm ${
                  form.printMode ? "bg-lime-300" : "bg-white"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-md border-2 border-black bg-amber-500 transition duration-150 mt-0.5 ${
                    form.printMode ? "translate-x-7 ml-0.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Prévia */}
            <div className="neo-card-muted p-6 space-y-5">
              <h3 className="label-field mb-0">Prévia ao vivo</h3>
              <div className="neo-card-white p-5 space-y-5 !shadow-[4px_4px_0_0_#000]">
                <div className="text-center">
                  {form.photoPreview ? (
                    <AdProductThumb
                      src={form.photoPreview}
                      alt={form.title || "Prévia"}
                      type={form.adType}
                      title={form.title}
                      size="md"
                      className="mx-auto"
                    />
                  ) : (
                    <AdProductThumb
                      alt={form.title || "Prévia"}
                      type={form.adType}
                      title={form.title}
                      size="md"
                      className="mx-auto"
                    />
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-price text-xl font-bold min-h-[28px]">
                    {form.price || "—"}
                    {form.price && form.billingType === "recorrente" ? " /mês" : ""}
                  </p>
                  <h4 className="text-display text-base font-bold line-clamp-2">{form.title || "Título do anúncio"}</h4>
                  <p className="text-sm text-zinc-500 line-clamp-3 font-normal">{form.description || "Descrição aparecerá aqui."}</p>
                </div>
              </div>
            </div>

            <ActionButtonWithHint
              hint={TOOLTIP_COPY.generateAd}
              hintVariant="on-dark"
              type="submit"
              id="btn-submit-generate"
              disabled={isSubmitting || isCompressingPhoto}
              className="btn-primary"
            >
              {isSubmitting ? "Gerando…" : "⚡ Gerar anúncio grátis"}
            </ActionButtonWithHint>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
