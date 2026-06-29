import { type FormEvent } from "react";
import type { AdFormState } from "../hooks/useAdForm";
import { AdPreviewCard } from "./AdPreviewCard";
import { EmojiPicker } from "./EmojiPicker";
import { ThemePicker } from "./ThemePicker";
import { MyAdsPanel } from "./MyAdsPanel";
import { AdSenseSlot } from "./AdSenseSlot";
import { ViewEnter } from "./ViewEnter";
import { formatBRL, formatPhoneNumber, isValidPaymentUrl } from "../lib/formatters";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH, SITE_NAME } from "../lib/constants";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { ActionButtonWithHint, FieldLabelWithHint, FieldLegendWithHint } from "./HelpTooltip";

interface HomeViewProps {
  form: AdFormState;
  isSubmitting: boolean;
  adsenseReady: boolean;
  onFieldChange: <K extends keyof AdFormState>(field: K, value: AdFormState[K]) => void;
  onSubmitError: (error: string | null) => void;
  onSubmit: () => void;
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
  adsenseReady,
  onFieldChange,
  onSubmitError,
  onSubmit,
  onOpenSavedAd,
}: HomeViewProps) {
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

  const handleSubmit = (e: FormEvent) => {
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

    onSubmit();
  };

  const segmentBase = "neo-segment";
  const segmentActive = "neo-segment-active";
  const segmentIdle = "neo-segment-idle";

  return (
    <ViewEnter className="space-y-20">
      <div className="text-center max-w-lg mx-auto space-y-6 px-2">
        <span className="chip-accent">Sem cadastro · 100% grátis</span>

        <div className="neo-hero-banner mx-auto max-w-md">
          <h1 className="text-display text-3xl sm:text-4xl font-black leading-[1.05] text-black uppercase">
            Landing page
            <br />
            <span className="text-white bg-black px-2 py-0.5 inline-block mt-1 -rotate-1">em segundos</span>
          </h1>
        </div>

        <p className="text-base font-semibold text-black max-w-md mx-auto leading-snug">
          Emoji + tema + Pix + QR Code personalizado.
          <span className="block text-sm font-medium text-zinc-700 mt-1">Rápido como raio — {SITE_NAME}.</span>
        </p>
      </div>

      <MyAdsPanel onOpenAd={onOpenSavedAd} />

      <AdSenseSlot slot="topo" ready={adsenseReady} />

      <div className="max-w-xl mx-auto w-full">
        <div className="neo-card-white p-8 md:p-10">
          <header className="mb-10 pb-6 border-b-[3px] border-black">
            <h2 className="text-display text-xl font-black uppercase">Nova página de venda</h2>
            <p className="mt-2 text-sm font-bold text-zinc-700">Preencha e gere seu link + QR Code *</p>
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
                Telefone / WhatsApp (opcional)
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

            <EmojiPicker
              adType={form.adType}
              value={form.icon}
              onChange={(icon) => onFieldChange("icon", icon)}
            />

            <ThemePicker value={form.theme} onChange={(theme) => onFieldChange("theme", theme)} />

            <div className="neo-card-muted p-6 space-y-5">
              <h3 className="label-field mb-0">Prévia ao vivo</h3>
              <AdPreviewCard
                adType={form.adType}
                title={form.title}
                price={form.price}
                description={form.description}
                icon={form.icon}
                theme={form.theme}
                billingType={form.billingType}
                premium
              />
              <AdSenseSlot slot="meio" ready={adsenseReady} />
            </div>

            <ActionButtonWithHint
              hint={TOOLTIP_COPY.generateAd}
              hintVariant="on-dark"
              type="submit"
              id="btn-submit-generate"
              disabled={isSubmitting}
              className="btn-primary"
              aria-label={isSubmitting ? "Gerando página" : "Gerar landing page grátis"}
            >
              {isSubmitting ? "Gerando…" : "⚡ Gerar landing page grátis"}
            </ActionButtonWithHint>
          </form>
        </div>
      </div>
    </ViewEnter>
  );
}
