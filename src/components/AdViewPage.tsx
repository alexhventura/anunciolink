import { useEffect, useId, useState } from "react";
import { CreditCard, MessageCircle, Share2, Zap } from "lucide-react";
import type { AdData } from "../types/ad";
import { isAdExpired } from "../lib/adExpiry";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdPreviewCard } from "./AdPreviewCard";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { AdExpiredBanner } from "./AdExpiredBanner";
import { AdLandingOfflineShare } from "./AdLandingOfflineShare";
import { SecurityBadge } from "./SecurityBadge";
import { ViewEnter } from "./ViewEnter";
import { PixPaymentSection } from "./PixPaymentSection";
import { copyToClipboard } from "../lib/formatters";

interface AdViewPageProps {
  ad: AdData;
  adsenseReady: boolean;
  onCreateOwn: () => void;
}

export function AdViewPage({ ad, adsenseReady, onCreateOwn }: AdViewPageProps) {
  const [pixCopied, setPixCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const actionsHeadingId = useId();
  const qrHeadingId = useId();
  const promoHeadingId = useId();

  useEffect(() => {
    setIsExpired(isAdExpired(ad));
  }, [ad]);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const handleCopyPix = async () => {
    if (!ad.pix || isExpired) return;
    const ok = await copyToClipboard(ad.pix);
    if (ok) {
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const hasPayment = Boolean(ad.pix || ad.cardLink);
  const safeCardLink = ad.cardLink;
  const showActions = !isExpired && (hasPayment || ad.phone);

  return (
    <ViewEnter
      as="article"
      className="ad-landing-page mx-auto w-full max-w-2xl min-w-0 px-3 sm:px-4 md:px-6 pb-8 sm:pb-10 md:pb-14"
      itemScope
      itemType="https://schema.org/Product"
    >
      {showActions && (
        <a
          href="#landing-actions"
          className="ad-landing-skip sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded-lg focus:border-2 focus:border-black focus:bg-amber-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Ir para pagamento e contato
        </a>
      )}

      <AdBrandedSurface variant="create" contentClassName="ad-landing-page__content">
        <AdSenseSlot slot="topo" ready={adsenseReady} />

        {isExpired && <AdExpiredBanner />}

        <section className="ad-landing-page__hero" aria-label="Resumo do anúncio">
          <AdPreviewCard
            adType={ad.t}
            title={ad.title}
            price={ad.price}
            description={ad.desc}
            icon={ad.icon}
            theme={ad.theme}
            billingType={ad.billingType}
            showSecurityBadge
            premium
            landing
            className={isExpired ? "opacity-95" : ""}
          />
        </section>

        {isExpired ? (
          <div className="ad-landing-page__cta-stack view-enter-delayed">
            <button
              type="button"
              onClick={onCreateOwn}
              id="btn-buyer-expired-cta"
              className="ad-landing-cta ad-landing-cta--primary btn-primary w-full"
              aria-label="Criar meu anúncio grátis no AnúncioLink"
            >
              <Zap className="h-6 w-6 shrink-0 fill-amber-500 stroke-black" strokeWidth={2.5} aria-hidden="true" />
              <span className="ad-landing-cta__copy">
                <span className="ad-landing-cta__eyebrow">Quer vender algo rápido assim também?</span>
                <span className="ad-landing-cta__label">Criar minha landing page grátis</span>
              </span>
            </button>
            <button
              type="button"
              disabled
              id="btn-buyer-ad-closed"
              className="btn-ad-closed w-full"
              aria-disabled="true"
              aria-label="Anúncio encerrado"
            >
              Anúncio encerrado
            </button>
          </div>
        ) : (
          <>
            {showActions && (
              <section
                id="landing-actions"
                className="ad-landing-page__actions neo-card-white"
                aria-labelledby={actionsHeadingId}
              >
                <header className="ad-landing-section__header">
                  <h2 id={actionsHeadingId} className="ad-landing-section__title">
                    Pagamento e contato
                  </h2>
                  <p className="ad-landing-section__lead">
                    {hasPayment && ad.phone
                      ? "Pague agora ou fale direto com quem publicou."
                      : hasPayment
                        ? "Escolha como pagar abaixo."
                        : "Tire dúvidas com quem publicou o anúncio."}
                  </p>
                  <SecurityBadge compact className="mt-3" />
                </header>

                <div className="ad-landing-page__cta-stack">
                  {ad.pix && (
                    <PixPaymentSection
                      pixCode={ad.pix}
                      copied={pixCopied}
                      onCopy={handleCopyPix}
                      layout={safeCardLink ? "split" : "full"}
                      primary
                    />
                  )}

                  {safeCardLink && (
                    <a
                      href={safeCardLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={ad.pix ? "link-buyer-card-split" : "link-buyer-card-full"}
                      className={`ad-landing-cta ad-landing-cta--card btn-payment-card w-full ${ad.pix ? "ad-landing-cta--secondary" : ""}`}
                      aria-label="Pagar com cartão em site externo do vendedor — abre em nova aba"
                    >
                      <CreditCard className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                      Pagar com cartão
                    </a>
                  )}

                  {ad.phone && (
                    <a
                      href={`https://wa.me/${ad.phone}?text=${encodeURIComponent(
                        `Olá! Vi seu anúncio "${ad.title}" no AnúncioLink. Gostaria de combinar a compra.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      id="btn-wa-buyer-contact"
                      className={`ad-landing-cta btn-whatsapp w-full ${hasPayment ? "ad-landing-cta--secondary" : "ad-landing-cta--primary"}`}
                      aria-label="Conversar com o vendedor via WhatsApp — abre em nova aba"
                    >
                      <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      <span className="ad-landing-cta__label">Falar no WhatsApp</span>
                    </a>
                  )}
                </div>

                {hasPayment && (
                  <p className="ad-landing-page__trust-note" role="note">
                    Pagamento direto ao vendedor · link seguro, sem intermediário
                  </p>
                )}
              </section>
            )}

            {pageUrl && (
              <AdLandingOfflineShare url={pageUrl} theme={ad.theme} headingId={qrHeadingId} />
            )}
          </>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        {!isExpired && (
          <aside
            className="ad-landing-page__promo neo-card-muted no-print"
            aria-labelledby={promoHeadingId}
          >
            <Share2 className="ad-landing-page__promo-icon h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            <h2 id={promoHeadingId} className="ad-landing-section__title ad-landing-section__title--sm">
              Quer vender assim também?
            </h2>
            <p className="ad-landing-section__lead ad-landing-section__lead--center">
              Crie sua landing page grátis em segundos — sem cadastro.
            </p>
            <button
              type="button"
              onClick={onCreateOwn}
              id="btn-buyer-create-own-ad"
              className="ad-landing-cta btn-ghost w-full sm:w-auto sm:min-w-[220px]"
              aria-label="Criar minha landing page grátis"
            >
              Criar minha página
            </button>
          </aside>
        )}
      </AdBrandedSurface>
    </ViewEnter>
  );
}
