import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, ShieldCheck, Zap } from "lucide-react";
import type { AdData } from "../types/ad";
import { isAdExpired } from "../lib/adExpiry";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { AdShareTools } from "./AdShareTools";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { AdExpiredBanner } from "./AdExpiredBanner";
import { copyToClipboard } from "../lib/formatters";

interface AdViewPageProps {
  ad: AdData;
  adsenseReady: boolean;
  onCreateOwn: () => void;
}

export function AdViewPage({ ad, adsenseReady, onCreateOwn }: AdViewPageProps) {
  const [pixCopied, setPixCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsExpired(isAdExpired(ad));
  }, [ad]);

  const handleCopyPix = async () => {
    if (!ad.pix || isExpired) return;
    const ok = await copyToClipboard(ad.pix);
    if (ok) {
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const hasPayment = Boolean(ad.pix || ad.cardLink);
  const hasContactActions = hasPayment || Boolean(ad.phone);
  const pixBtnClass = pixCopied ? "btn-checkout-pix-copied" : "btn-checkout-pix";

  return (
    <motion.article
      key="ad-screen"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto pb-16"
      itemScope
      itemType="https://schema.org/Product"
    >
      <AdBrandedSurface variant="checkout" contentClassName="checkout-page">
        <AdSenseSlot slot="topo" ready={adsenseReady} />

        {isExpired && <AdExpiredBanner />}

        <div className={`checkout-image ${isExpired ? "checkout-image--expired" : ""}`}>
          <AdImage
            src={ad.img}
            crop={ad.crop}
            alt={ad.title}
            type={ad.t}
            title={ad.title}
            priority
            variant="checkout"
          />
        </div>

        <div className={`checkout-card space-y-4 ${isExpired ? "checkout-card--expired" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            {isExpired ? (
              <span className="checkout-badge checkout-badge-expired">Encerrado</span>
            ) : (
              <span className="checkout-badge">Disponível</span>
            )}
            {ad.billingType === "recorrente" && (
              <span className="checkout-badge checkout-badge-muted">Recorrente</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight leading-snug" itemProp="name">
            {ad.title}
          </h1>
          <p
            className="checkout-price"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{ad.price}</span>
            {ad.billingType === "recorrente" && (
              <span className="text-lg font-semibold text-zinc-500"> /mês</span>
            )}
            <meta itemProp="priceCurrency" content="BRL" />
          </p>
        </div>

        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <button
              type="button"
              onClick={onCreateOwn}
              id="btn-buyer-expired-cta"
              className="btn-checkout-expired-cta"
            >
              <Zap className="h-6 w-6 shrink-0 fill-amber-400 stroke-amber-600" strokeWidth={2} aria-hidden="true" />
              <span className="btn-checkout-expired-cta__text">
                <span className="block text-sm font-medium text-amber-100/90">
                  Quer vender algo rápido assim também?
                </span>
                <span className="block text-base sm:text-lg font-bold text-white">
                  Criar meu Anúncio Grátis no AnúncioLink
                </span>
              </span>
            </button>
          </motion.div>
        )}

        <section className="checkout-card space-y-3">
          <h2 className="checkout-label">Descrição</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-600" itemProp="description">
            {ad.desc}
          </p>
        </section>

        <AdShareTools ad={ad} variant="checkout" />

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        {hasContactActions && (
          <section
            className={`checkout-card space-y-4 ${isExpired ? "checkout-card--expired-actions" : ""}`}
            aria-label={isExpired ? "Anúncio encerrado" : "Pagamento seguro"}
          >
            {isExpired ? (
              <button
                type="button"
                disabled
                id="btn-buyer-ad-closed"
                className="btn-checkout-closed"
                aria-disabled="true"
              >
                Anúncio Encerrado
              </button>
            ) : (
              <>
                {hasPayment && (
                  <>
                    <div className="flex items-start gap-3 pb-1">
                      <ShieldCheck className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                      <div>
                        <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Finalizar compra</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Ambiente seguro · Pagamento direto ao vendedor</p>
                      </div>
                    </div>

                    {ad.pix && ad.cardLink ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          id="btn-buyer-pix-split"
                          aria-live="polite"
                          className={pixBtnClass}
                        >
                          {pixCopied ? "✓ Pix copiado" : "Copiar chave Pix"}
                        </button>
                        <a
                          href={ad.cardLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          id="link-buyer-card-split"
                          className="btn-checkout-card"
                        >
                          Pagar com cartão
                        </a>
                      </div>
                    ) : ad.pix ? (
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        id="btn-buyer-pix-full"
                        aria-live="polite"
                        className={pixBtnClass}
                      >
                        {pixCopied ? "✓ Chave Pix copiada" : "Copiar chave Pix"}
                      </button>
                    ) : (
                      <a
                        href={ad.cardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="link-buyer-card-full"
                        className="btn-checkout-card"
                      >
                        Pagar com cartão
                      </a>
                    )}
                  </>
                )}

                {ad.phone && (
                  <a
                    href={`https://wa.me/${ad.phone}?text=${encodeURIComponent(
                      `Olá! Vi seu anúncio "${ad.title}" no Anuncio Link. Gostaria de combinar a compra.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-wa-buyer-contact"
                    className="btn-checkout-whatsapp"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                    WhatsApp com vendedor
                  </a>
                )}

                {hasPayment && (
                  <p className="text-[11px] text-zinc-400 text-center">
                    Transação direta entre comprador e vendedor
                  </p>
                )}
              </>
            )}
          </section>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        {!isExpired && (
          <aside className="checkout-card-muted text-center space-y-3 py-6 no-print">
            <h3 className="text-sm font-semibold text-zinc-800">Anuncie em segundos</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">Grátis, sem cadastro.</p>
            <button type="button" onClick={onCreateOwn} id="btn-buyer-create-own-ad" className="btn-checkout-ghost">
              Criar meu anúncio
            </button>
          </aside>
        )}
      </AdBrandedSurface>
    </motion.article>
  );
}
