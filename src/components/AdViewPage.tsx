import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Zap } from "lucide-react";
import type { AdData } from "../types/ad";
import { isAdExpired } from "../lib/adExpiry";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { AdExpiredBanner } from "./AdExpiredBanner";
import { copyToClipboard } from "../lib/formatters";

interface AdViewPageProps {
  ad: AdData;
  adsenseReady: boolean;
  onCreateOwn: () => void;
}

const TYPE_LABEL: Record<AdData["t"], string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

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
  const priceLabel = ad.price + (ad.billingType === "recorrente" ? " /mês" : "");
  const pixBtnClass = pixCopied ? "btn-payment-pix-copied" : "btn-payment-pix";

  return (
    <motion.article
      key="ad-screen"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto pb-8"
      itemScope
      itemType="https://schema.org/Product"
    >
      <AdBrandedSurface variant="create" contentClassName="space-y-6">
        <AdSenseSlot slot="topo" ready={adsenseReady} />

        {isExpired && <AdExpiredBanner />}

        <div className={`neo-card-white overflow-hidden ${isExpired ? "opacity-95" : ""}`}>
          <div className="bento-image !rounded-none !border-x-0 !border-t-0 !shadow-none">
            <AdImage
              src={ad.img}
              crop={ad.crop}
              alt={ad.title}
              type={ad.t}
              title={ad.title}
              priority
              variant="create"
            />
          </div>

          <div className="p-6 md:p-8 space-y-4 border-t-[3px] border-black bg-amber-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip !bg-black !text-amber-400">{TYPE_LABEL[ad.t]}</span>
              {isExpired ? (
                <span className="chip !bg-zinc-200 !text-zinc-700">Encerrado</span>
              ) : (
                <span className="chip-accent">Disponível</span>
              )}
              {ad.billingType === "recorrente" && (
                <span className="chip !bg-white !text-black">Recorrente</span>
              )}
            </div>

            <h1
              className="text-display text-xl sm:text-2xl font-black text-black leading-snug"
              itemProp="name"
            >
              {ad.title}
            </h1>

            <p
              className="text-3xl sm:text-4xl font-black text-black bg-white border-[3px] border-black inline-block px-4 py-2 neo-shadow-sm tabular-nums"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span itemProp="price">{priceLabel}</span>
              <meta itemProp="priceCurrency" content="BRL" />
            </p>
          </div>
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
              className="btn-primary w-full !min-h-[72px] !text-base gap-3"
            >
              <Zap className="h-6 w-6 shrink-0 fill-amber-500 stroke-black" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-left">
                <span className="block text-xs font-bold uppercase opacity-80">
                  Quer vender algo rápido assim também?
                </span>
                <span className="block font-black">Criar meu Anúncio Grátis no AnúncioLink</span>
              </span>
            </button>
          </motion.div>
        )}

        <section className="neo-card-white p-6 md:p-8 space-y-3">
          <h2 className="label-field mb-0">Descrição</h2>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 font-medium"
            itemProp="description"
          >
            {ad.desc}
          </p>
        </section>

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        {(hasPayment || ad.phone) && (
          <section
            className={`neo-card-white p-6 md:p-8 space-y-4 ${isExpired ? "opacity-80" : ""}`}
            aria-label={isExpired ? "Anúncio encerrado" : "Pagamento e contato"}
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
                  <div className="space-y-3">
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
                          className="btn-payment-card"
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
                        className={`${pixBtnClass} w-full`}
                      >
                        {pixCopied ? "✓ Chave Pix copiada" : "Copiar chave Pix"}
                      </button>
                    ) : (
                      <a
                        href={ad.cardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="link-buyer-card-full"
                        className="btn-payment-card w-full"
                      >
                        Pagar com cartão
                      </a>
                    )}
                  </div>
                )}

                {ad.phone && (
                  <a
                    href={`https://wa.me/${ad.phone}?text=${encodeURIComponent(
                      `Olá! Vi seu anúncio "${ad.title}" no AnúncioLink. Gostaria de combinar a compra.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-wa-buyer-contact"
                    className="btn-whatsapp"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    Conversar com o Vendedor via WhatsApp
                  </a>
                )}

                {hasPayment && (
                  <p className="text-[11px] font-semibold text-zinc-500 text-center">
                    Pagamento direto ao vendedor · ambiente seguro
                  </p>
                )}
              </>
            )}
          </section>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        {!isExpired && (
          <aside className="neo-card-muted text-center space-y-3 p-6 no-print">
            <h3 className="text-sm font-black uppercase text-black">Anuncie em segundos</h3>
            <p className="text-xs font-medium text-zinc-700 max-w-xs mx-auto">Grátis, sem cadastro.</p>
            <button type="button" onClick={onCreateOwn} id="btn-buyer-create-own-ad" className="btn-ghost">
              Criar meu anúncio
            </button>
          </aside>
        )}
      </AdBrandedSurface>
    </motion.article>
  );
}
