import { useState } from "react";
import { motion } from "motion/react";
import type { AdData } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { copyToClipboard } from "../lib/formatters";

interface AdViewPageProps {
  ad: AdData;
  adsenseReady: boolean;
  onCreateOwn: () => void;
}

export function AdViewPage({ ad, adsenseReady, onCreateOwn }: AdViewPageProps) {
  const [pixCopied, setPixCopied] = useState(false);

  const handleCopyPix = async () => {
    if (!ad.pix) return;
    const ok = await copyToClipboard(ad.pix);
    if (ok) {
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const hasPayment = Boolean(ad.pix || ad.cardLink);
  const pixBtnClass = pixCopied ? "btn-payment-pix-copied" : "btn-payment-pix";

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
      <div className="bento-page">
        <AdSenseSlot slot="topo" ready={adsenseReady} />

        {/* Bento: imagem */}
        <div className="bento-image">
          <AdImage
            src={ad.img}
            alt={ad.title}
            type={ad.t}
            title={ad.title}
            printMode={ad.printMode}
            priority
          />
        </div>

        {/* Bento: título + preço */}
        <div className="bento space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip-accent">Disponível</span>
            {ad.billingType === "recorrente" && (
              <span className="chip">Recorrente</span>
            )}
          </div>
          <h1 className="text-display text-2xl sm:text-[1.75rem] leading-tight font-bold" itemProp="name">
            {ad.title}
          </h1>
          <p
            className="text-price text-3xl sm:text-4xl font-extrabold min-h-[44px]"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{ad.price}</span>
            <meta itemProp="priceCurrency" content="BRL" />
          </p>
        </div>

        {/* Bento: descrição */}
        <section className="bento bento-desc space-y-3">
          <h2 className="label-field mb-0">Descrição</h2>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-zinc-600"
            itemProp="description"
          >
            {ad.desc}
          </p>
        </section>

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        {/* Bento: pagamento — máximo destaque */}
        {(hasPayment || ad.phone) && (
          <section className="bento bento-actions space-y-4" aria-label="Ações de contato e pagamento">
            {hasPayment && (
              <>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Finalizar compra</h2>
                  <p className="text-xs font-normal text-zinc-500">Escolha como deseja pagar</p>
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
                      {pixCopied ? "Pix copiado" : "Copiar chave Pix"}
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
                    className={pixBtnClass}
                  >
                    {pixCopied ? "Chave Pix copiada" : "Copiar chave Pix"}
                  </button>
                ) : (
                  <a
                    href={ad.cardLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="link-buyer-card-full"
                    className="btn-payment-card"
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
                className="btn-whatsapp"
              >
                Conversar no WhatsApp
              </a>
            )}

            {hasPayment && (
              <p className="text-[11px] text-zinc-400 text-center font-normal leading-relaxed pt-1">
                Transação direta entre comprador e vendedor. Sem intermediação.
              </p>
            )}
          </section>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        <aside className="bento-muted text-center space-y-4 py-8">
          <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Anuncie em segundos</h3>
          <p className="text-xs text-zinc-500 font-normal max-w-xs mx-auto leading-relaxed">
            Grátis, sem cadastro. Pix e link compartilhável.
          </p>
          <button type="button" onClick={onCreateOwn} id="btn-buyer-create-own-ad" className="btn-accent">
            Criar meu anúncio
          </button>
        </aside>
      </div>
    </motion.article>
  );
}
