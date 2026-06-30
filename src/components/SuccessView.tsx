import { lazy, Suspense } from "react";
import { Check, Lightbulb, Lock, Zap } from "lucide-react";
import type { AdFormState } from "../hooks/useAdForm";
import type { AdData } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdPreviewCard } from "./AdPreviewCard";
import { ViewEnter } from "./ViewEnter";

const ShareChannels = lazy(() =>
  import("./ShareChannels").then((m) => ({ default: m.ShareChannels }))
);

interface SuccessViewProps {
  form: AdFormState;
  generatedLink: string;
  adsenseReady: boolean;
  textOptimizedWarning?: boolean;
  onResetHome: () => void;
}

export function SuccessView({
  form,
  generatedLink,
  adsenseReady,
  textOptimizedWarning,
  onResetHome,
}: SuccessViewProps) {
  const adSnapshot: AdData = {
    t: form.adType,
    title: form.title,
    price: form.price,
    billingType: form.billingType,
    desc: form.description,
    phone: form.phone,
    pix: form.pix || undefined,
    cardLink: form.cardLink || undefined,
    icon: form.icon,
    timestamp: Date.now(),
  };

  return (
    <ViewEnter className="max-w-xl mx-auto w-full min-w-0 px-1 sm:px-0 space-y-8 sm:space-y-10">
      <AdSenseSlot slot="topo" ready={adsenseReady} />

      <div className="neo-card-white p-8 md:p-10 text-center space-y-8 no-print">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border-[3px] border-black bg-lime-300 neo-shadow">
          <Check className="h-8 w-8 text-black" strokeWidth={3} aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <div className="neo-hero-banner mx-auto max-w-sm !rotate-0">
            <h1 className="neo-hero-banner__title text-display font-black uppercase flex flex-wrap items-center justify-center gap-2">
              <Zap className="h-7 w-7 fill-amber-500 stroke-black" strokeWidth={2.5} aria-hidden="true" />
              Anúncio publicado
            </h1>
          </div>
          <p className="text-sm font-bold text-black max-w-sm mx-auto">
            Compartilhe a imagem com o link, copie o endereço ou baixe PDF e JPG para impressão.
          </p>
        </div>

        {textOptimizedWarning && (
          <div
            role="status"
            className="rounded-lg border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-xs font-semibold text-zinc-700 text-left neo-shadow-sm"
          >
            Texto otimizado para caber no link do WhatsApp.
          </div>
        )}

        {form.password.trim() ? (
          <div
            role="status"
            className="rounded-lg border-[3px] border-black bg-amber-100 px-4 py-3 text-xs font-bold text-black text-left neo-shadow-sm flex gap-2 items-start"
          >
            <Lock className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
            <p>
              Link protegido por senha. Envie a senha separadamente para quem deve ver o anúncio — ela
              não fica salva em servidor, só na memória de quem criou.
            </p>
          </div>
        ) : null}

        <div className="space-y-6 text-left">
          <Suspense
            fallback={
              <div className="neo-inset p-6 text-center text-xs font-bold text-zinc-500">
                Carregando opções…
              </div>
            }
          >
            <ShareChannels ad={adSnapshot} shareUrl={generatedLink} />
          </Suspense>

          <aside
            role="note"
            aria-labelledby="link-shortener-tip-heading"
            className="rounded-lg border-2 border-zinc-900 bg-amber-100 px-4 py-3.5 neo-shadow-sm"
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
                <strong className="font-black text-black">Link grande?</strong> Encurte no{" "}
                <a
                  href="https://bitly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black underline decoration-amber-600 underline-offset-2"
                >
                  bitly.com
                </a>{" "}
                ou{" "}
                <a
                  href="https://tinyurl.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black underline decoration-amber-600 underline-offset-2"
                >
                  tinyurl.com
                </a>{" "}
                para bio e stories.
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 border-t-[3px] border-black pt-8">
          <a
            href={generatedLink}
            target="_blank"
            rel="noopener noreferrer"
            id="link-preview-direct"
            className="btn-primary !text-sm"
            aria-label="Abrir página do anúncio em nova aba"
          >
            Abrir anúncio
          </a>
          <button
            type="button"
            onClick={onResetHome}
            id="btn-create-another-success"
            className="btn-ghost !min-h-[64px]"
            aria-label="Criar um novo anúncio do zero"
          >
            Novo anúncio
          </button>
        </div>
      </div>

      <div className="no-print max-w-lg mx-auto space-y-6">
        <AdPreviewCard
          adType={form.adType}
          title={form.title}
          price={form.price}
          description={form.description}
          icon={form.icon}
          billingType={form.billingType}
          premium
        />
        <AdSenseSlot slot="meio" ready={adsenseReady} />
      </div>
    </ViewEnter>
  );
}
