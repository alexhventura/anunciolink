import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Zap } from "lucide-react";
import type { AdData } from "../types/ad";
import { isAdExpired } from "../lib/adExpiry";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdPreviewCard } from "./AdPreviewCard";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { AdExpiredBanner } from "./AdExpiredBanner";
import { SecurityBadge } from "./SecurityBadge";
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
  const pixBtnClass = pixCopied ? "btn-payment-pix-copied" : "btn-payment-pix";
  const safeCardLink = ad.cardLink;

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

        <AdPreviewCard
          adType={ad.t}
          title={ad.title}
          price={ad.price}
          description={ad.desc}
          image={ad.img}
          billingType={ad.billingType}
          priority
          showSecurityBadge
          className={isExpired ? "opacity-95" : ""}
        />

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        {isExpired ? (
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
              aria-label="Criar meu anúncio grátis no AnúncioLink"
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
        ) : (
          (hasPayment || ad.phone) && (
            <section className="neo-card-white p-6 md:p-8 space-y-4" aria-label="Pagamento e contato do vendedor">
              <div className="flex justify-center">
                <SecurityBadge compact />
              </div>

              {hasPayment && (
                <div className="space-y-3">
                  {ad.pix && safeCardLink ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        id="btn-buyer-pix-split"
                        aria-live="polite"
                        aria-label={pixCopied ? "Chave Pix copiada" : "Copiar chave Pix do vendedor"}
                        className={pixBtnClass}
                      >
                        {pixCopied ? "✓ Pix copiado" : "Copiar chave Pix"}
                      </button>
                      <a
                        href={safeCardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="link-buyer-card-split"
                        className="btn-payment-card"
                        aria-label="Pagar com cartão em site externo do vendedor"
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
                      aria-label={pixCopied ? "Chave Pix copiada" : "Copiar chave Pix do vendedor"}
                      className={`${pixBtnClass} w-full`}
                    >
                      {pixCopied ? "✓ Chave Pix copiada" : "Copiar chave Pix"}
                    </button>
                  ) : (
                    safeCardLink && (
                      <a
                        href={safeCardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="link-buyer-card-full"
                        className="btn-payment-card w-full"
                        aria-label="Pagar com cartão em site externo do vendedor"
                      >
                        Pagar com cartão
                      </a>
                    )
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
                  aria-label="Conversar com o vendedor via WhatsApp em nova aba"
                >
                  <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  Conversar com o Vendedor via WhatsApp
                </a>
              )}

              {hasPayment && (
                <p className="text-[11px] font-semibold text-zinc-600 text-center">
                  Pagamento direto ao vendedor · dados criptografados no link
                </p>
              )}
            </section>
          )
        )}

        {isExpired && (
          <button
            type="button"
            disabled
            id="btn-buyer-ad-closed"
            className="btn-checkout-closed w-full"
            aria-disabled="true"
            aria-label="Anúncio encerrado"
          >
            Anúncio Encerrado
          </button>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        {!isExpired && (
          <aside className="neo-card-muted text-center space-y-3 p-6 no-print">
            <h3 className="text-sm font-black uppercase text-black">Anuncie em segundos</h3>
            <p className="text-xs font-medium text-zinc-700 max-w-xs mx-auto">Grátis, sem cadastro.</p>
            <button
              type="button"
              onClick={onCreateOwn}
              id="btn-buyer-create-own-ad"
              className="btn-ghost"
              aria-label="Criar meu próprio anúncio grátis"
            >
              Criar meu anúncio
            </button>
          </aside>
        )}
      </AdBrandedSurface>
    </motion.article>
  );
}
