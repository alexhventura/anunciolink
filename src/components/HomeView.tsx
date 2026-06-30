import { ChevronDown, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, type FormEvent, useCallback, useMemo, useState } from "react";
import type { AdFormState } from "../hooks/useAdForm";
import { focusFirstField } from "../lib/focusMainContent";
import {
  FIELD_MICROCOPY,
  FORM_SECTION_COPY,
  descriptionPlaceholder,
  priceLabel,
  titlePlaceholder,
} from "../lib/formMicrocopy";
import {
  formatBRL,
  formatPhoneNumber,
  formatPixInput,
  normalizePaymentUrlInput,
} from "../lib/formatters";
import {
  type AdFormFieldErrors,
  type AdFormFieldKey,
  firstAdFormError,
  hasAdFormErrors,
  validateAdForm,
  validateAdFormField,
} from "../lib/formValidation";
import { MAX_DESC_LENGTH, MAX_PIX_LENGTH, MAX_TITLE_LENGTH, SITE_NAME } from "../lib/constants";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { AdFormField } from "./AdFormField";
import { AdPreviewCard } from "./AdPreviewCard";
import { ThemePicker } from "./ThemePicker";
import { MyAdsPanel } from "./MyAdsPanel";
import { AdSenseSlot } from "./AdSenseSlot";
import { PayloadScoreIndicator } from "./PayloadScoreIndicator";
import { ViewEnter } from "./ViewEnter";
import { ActionButtonWithHint, FieldLegendWithHint, HelpTooltip } from "./HelpTooltip";

const IconPicker = lazy(() =>
  import("./IconPicker").then((m) => ({ default: m.IconPicker }))
);

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

const REQUIRED_FIELDS: AdFormFieldKey[] = ["title", "price", "description"];

function toFormValues(form: AdFormState) {
  return {
    adType: form.adType,
    title: form.title,
    price: form.price,
    description: form.description,
    phone: form.phone,
    pix: form.pix,
    cardLink: form.cardLink,
  };
}

export function HomeView({
  form,
  isSubmitting,
  adsenseReady,
  onFieldChange,
  onSubmitError,
  onSubmit,
  onOpenSavedAd,
}: HomeViewProps) {
  const [touched, setTouched] = useState<Partial<Record<AdFormFieldKey, boolean>>>({});
  const [optionalOpen, setOptionalOpen] = useState(true);
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const formValues = useMemo(() => toFormValues(form), [form]);

  useEffect(() => {
    if (form.submitError) {
      submitErrorRef.current?.focus();
    }
  }, [form.submitError]);

  const fieldErrors = useMemo(() => {
    const errors: AdFormFieldErrors = {};
    for (const field of Object.keys(touched) as AdFormFieldKey[]) {
      if (!touched[field]) continue;
      const message = validateAdFormField(field, formValues);
      if (message) errors[field] = message;
    }
    return errors;
  }, [formValues, touched]);

  const markTouched = useCallback((field: AdFormFieldKey) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const handleBlur = useCallback(
    (field: AdFormFieldKey) => {
      markTouched(field);
    },
    [markTouched]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmitError(null);

    const allTouched = REQUIRED_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      { phone: true, pix: true, cardLink: true } as Partial<Record<AdFormFieldKey, boolean>>
    );
    setTouched(allTouched);

    const errors = validateAdForm(formValues);
    if (hasAdFormErrors(errors)) {
      onSubmitError(firstAdFormError(errors) ?? "Revise os campos em destaque.");
      const firstInvalid = (["title", "price", "description", "phone", "pix", "cardLink"] as const).find(
        (field) => errors[field]
      );
      if (firstInvalid) {
        queueMicrotask(() => focusFirstField(firstInvalid));
      }
      return;
    }

    onSubmit();
  };

  const inputClass = (field: AdFormFieldKey) =>
    `input-field ${fieldErrors[field] ? "input-field--error" : ""}`;

  const segmentBase = "neo-segment";
  const segmentActive = "neo-segment-active";
  const segmentIdle = "neo-segment-idle";

  return (
    <ViewEnter className="space-y-16 sm:space-y-20">
      <div className="text-center max-w-lg mx-auto space-y-6 px-2">
        <span className="chip-accent">Sem cadastro · 100% grátis</span>

        <div className="neo-hero-banner mx-auto max-w-lg w-full">
          <h1 className="neo-hero-banner__title text-display font-black leading-[1.08] text-black uppercase">
            Anúncios
            <br />
            <span className="text-white bg-black px-2 py-0.5 inline-block mt-1 -rotate-1">Em Segundos</span>
          </h1>
        </div>

        <p className="text-base font-semibold text-black max-w-md mx-auto leading-snug">
          Ícone + tema + Pix + QR Code personalizado.
          <span className="block text-sm font-medium text-zinc-700 mt-1">Rápido como raio — {SITE_NAME}.</span>
        </p>
      </div>

      <MyAdsPanel onOpenAd={onOpenSavedAd} />

      <AdSenseSlot slot="topo" ready={adsenseReady} />

      <div className="ad-form-bento max-w-6xl mx-auto w-full px-2 sm:px-3 min-w-0">
        <form onSubmit={handleSubmit} className="ad-form-bento__grid" noValidate>
          <div className="ad-form-bento__main space-y-6">
            {form.submitError && (
              <div
                ref={submitErrorRef}
                tabIndex={-1}
                role="alert"
                className="rounded-lg border-[3px] border-black bg-red-400 px-4 py-3 text-sm font-bold text-black neo-shadow-sm"
              >
                {form.submitError}
              </div>
            )}

            {/* ——— Obrigatórios ——— */}
            <section className="ad-form-section ad-form-section--required neo-card-white p-4 sm:p-6 md:p-8">
              <header className="ad-form-section__header">
                <div className="ad-form-section__titles">
                  <span className="ad-form-section__badge ad-form-section__badge--required">
                    {FORM_SECTION_COPY.required.badge}
                  </span>
                  <h2 className="ad-form-section__title">{FORM_SECTION_COPY.required.title}</h2>
                  <p className="ad-form-section__subtitle">{FORM_SECTION_COPY.required.subtitle}</p>
                </div>
                <HelpTooltip text={TOOLTIP_COPY.formRequired} placement="top" />
              </header>

              <div className="ad-form-bento__cells">
                <fieldset className="ad-form-bento__cell ad-form-bento__cell--wide space-y-3">
                  <FieldLegendWithHint hint={TOOLTIP_COPY.adType} fieldLabel="Tipo de anúncio">
                    Tipo de anúncio
                  </FieldLegendWithHint>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
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

                <fieldset className="ad-form-bento__cell space-y-3">
                  <FieldLegendWithHint hint={TOOLTIP_COPY.billing} fieldLabel="Tipo de cobrança">
                    Cobrança
                  </FieldLegendWithHint>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {(["unico", "recorrente"] as const).map((billing) => (
                      <button
                        key={billing}
                        type="button"
                        id={`select-billing-${billing}`}
                        aria-pressed={form.billingType === billing}
                        aria-label={billing === "unico" ? "Preço único" : "Cobrança recorrente mensal"}
                        onClick={() => onFieldChange("billingType", billing)}
                        className={`${segmentBase} ${
                          form.billingType === billing ? "neo-segment-amber" : segmentIdle
                        }`}
                      >
                        {billing === "unico" ? "Único" : "/mês"}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                  <AdFormField
                    id="title-input"
                    label="Título"
                    hint={TOOLTIP_COPY.title}
                    microcopy={FIELD_MICROCOPY.title}
                    error={fieldErrors.title}
                    counter={
                      <span className="ad-form-field__counter tabular-nums" aria-live="polite">
                        {form.title.length}/{MAX_TITLE_LENGTH}
                      </span>
                    }
                  >
                    <input
                      type="text"
                      id="title-input"
                      required
                      maxLength={MAX_TITLE_LENGTH}
                      value={form.title}
                      onChange={(e) => onFieldChange("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
                      placeholder={titlePlaceholder(form.adType)}
                      autoComplete="off"
                      className={inputClass("title")}
                    />
                  </AdFormField>
                </div>

                <div className="ad-form-bento__cell">
                  <AdFormField
                    id="price-input"
                    label={priceLabel(form.adType)}
                    hint={TOOLTIP_COPY.price}
                    microcopy={FIELD_MICROCOPY.price}
                    error={fieldErrors.price}
                  >
                    <input
                      type="text"
                      id="price-input"
                      required
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => onFieldChange("price", formatBRL(e.target.value))}
                      onBlur={() => handleBlur("price")}
                      placeholder="R$ 0,00"
                      className={`${inputClass("price")} font-semibold text-price`}
                    />
                  </AdFormField>
                </div>

                <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                  <AdFormField
                    id="desc-input"
                    label="Descrição"
                    hint={TOOLTIP_COPY.description}
                    microcopy={FIELD_MICROCOPY.description}
                    error={fieldErrors.description}
                      counter={
                      <span className="ad-form-field__counter tabular-nums" aria-live="polite">
                        {form.description.length}/{MAX_DESC_LENGTH}
                      </span>
                    }
                  >
                    <textarea
                      id="desc-input"
                      required
                      maxLength={MAX_DESC_LENGTH}
                      rows={5}
                      value={form.description}
                      onChange={(e) => onFieldChange("description", e.target.value)}
                      onBlur={() => handleBlur("description")}
                      placeholder={descriptionPlaceholder(form.adType)}
                      className={`${inputClass("description")} resize-y min-h-[120px]`}
                    />
                  </AdFormField>
                </div>
              </div>
            </section>

            {/* ——— Opcionais ——— */}
            <section className="ad-form-section ad-form-section--optional neo-card-muted p-4 sm:p-6 md:p-8">
              <header className="ad-form-section__header ad-form-section__header--collapsible">
                <div className="ad-form-section__titles">
                  <span className="ad-form-section__badge ad-form-section__badge--optional">
                    {FORM_SECTION_COPY.optional.badge}
                  </span>
                  <h2 className="ad-form-section__title">{FORM_SECTION_COPY.optional.title}</h2>
                  <p className="ad-form-section__subtitle">{FORM_SECTION_COPY.optional.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="ad-form-section__toggle"
                  aria-expanded={optionalOpen}
                  aria-controls="optional-fields"
                  aria-label={optionalOpen ? "Recolher campos opcionais" : "Expandir campos opcionais"}
                  onClick={() => setOptionalOpen((open) => !open)}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{optionalOpen ? "Recolher" : "Expandir"}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${optionalOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </header>

              {optionalOpen && (
                <div id="optional-fields" className="ad-form-bento__cells ad-form-bento__cells--optional">
                  <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                    <Suspense
                      fallback={
                        <div className="emoji-picker neo-inset p-6 text-center text-xs font-bold text-zinc-500">
                          Carregando ícones…
                        </div>
                      }
                    >
                      <IconPicker
                        adType={form.adType}
                        value={form.icon}
                        onChange={(icon) => onFieldChange("icon", icon)}
                      />
                    </Suspense>
                  </div>

                  <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                    <ThemePicker value={form.theme} onChange={(theme) => onFieldChange("theme", theme)} />
                  </div>

                  <div className="ad-form-bento__cell">
                    <AdFormField
                      id="phone-input"
                      label="Telefone / WhatsApp"
                      hint={TOOLTIP_COPY.phone}
                      microcopy={FIELD_MICROCOPY.phone}
                      error={fieldErrors.phone}
                      optional
                    >
                      <input
                        type="tel"
                        id="phone-input"
                        value={form.phone}
                        onChange={(e) => onFieldChange("phone", formatPhoneNumber(e.target.value))}
                        onBlur={() => handleBlur("phone")}
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        inputMode="tel"
                        className={`${inputClass("phone")} font-mono text-sm`}
                      />
                    </AdFormField>
                  </div>

                  <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                    <AdFormField
                      id="pix-input"
                      label="Pix copia e cola"
                      hint={TOOLTIP_COPY.pix}
                      microcopy={FIELD_MICROCOPY.pix}
                      error={fieldErrors.pix}
                      optional
                      counter={
                        <span className="ad-form-field__counter tabular-nums">
                          {form.pix.length}/{MAX_PIX_LENGTH}
                        </span>
                      }
                    >
                      <textarea
                        id="pix-input"
                        maxLength={MAX_PIX_LENGTH}
                        rows={2}
                        value={form.pix}
                        onChange={(e) => onFieldChange("pix", formatPixInput(e.target.value))}
                        onBlur={() => handleBlur("pix")}
                        placeholder="00020126…"
                        className={`${inputClass("pix")} font-mono text-xs resize-none`}
                      />
                    </AdFormField>
                  </div>

                  <div className="ad-form-bento__cell ad-form-bento__cell--wide">
                    <AdFormField
                      id="card-input"
                      label="Link de pagamento (cartão)"
                      hint={TOOLTIP_COPY.cardLink}
                      microcopy={FIELD_MICROCOPY.cardLink}
                      error={fieldErrors.cardLink}
                      optional
                    >
                      <input
                        type="url"
                        id="card-input"
                        value={form.cardLink}
                        onChange={(e) => onFieldChange("cardLink", e.target.value)}
                        onBlur={() => {
                          handleBlur("cardLink");
                          const normalized = normalizePaymentUrlInput(form.cardLink);
                          if (normalized !== form.cardLink) onFieldChange("cardLink", normalized);
                        }}
                        placeholder="https://link.mercadopago.com.br/…"
                        className={`${inputClass("cardLink")} font-mono text-sm`}
                      />
                    </AdFormField>
                  </div>
                </div>
              )}
            </section>

            <ActionButtonWithHint
              hint={TOOLTIP_COPY.generateAd}
              hintVariant="on-dark"
              type="submit"
              id="btn-submit-generate"
              disabled={isSubmitting}
              className="btn-primary"
              aria-busy={isSubmitting}
              aria-label={isSubmitting ? "Gerando página" : "Gerar landing page grátis"}
            >
              {isSubmitting ? "Gerando…" : "Gerar landing page grátis"}
            </ActionButtonWithHint>
          </div>

          <aside className="ad-form-bento__aside">
            <div className="ad-form-preview neo-card-white p-4 sm:p-5 md:p-6 space-y-4 min-w-0">
              <header>
                <h3 className="ad-form-section__title text-base">{FORM_SECTION_COPY.preview.title}</h3>
                <p className="ad-form-section__subtitle mt-1">{FORM_SECTION_COPY.preview.subtitle}</p>
              </header>
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
              <PayloadScoreIndicator form={form} />
              <AdSenseSlot slot="meio" ready={adsenseReady} />
            </div>
          </aside>
        </form>
      </div>
    </ViewEnter>
  );
}
