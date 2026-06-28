import { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import type { AdData } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { AdShareTools } from "./AdShareTools";
import { copyToClipboard } from "../lib/formatters";

interface AdViewPageProps {
  ad: AdData;
  adsenseReady: boolean;
  onCreateOwn: () => void;
}

export function AdViewPage({ ad, adsenseReady, onCreateOwn }: AdViewPageProps) {
  const [pixCopied, setPixCopied] = useState(false);
  const adUrl = window.location.href;

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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto pb-16"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="bento-page">
        <AdSenseSlot slot="topo" ready={adsenseReady} />

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

        <div className="neo-card space-y-4 neo-interactive cursor-default">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !bg-black !text-amber-400">Disponível</span>
            {ad.billingType === "recorrente" && <span className="chip">Recorrente</span>}
          </div>
          <h1 className="text-display text-2xl sm:text-3xl leading-tight" itemProp="name">
            {ad.title}
          </h1>
          <p
            className="text-price text-4xl sm:text-5xl min-h-[48px] bg-black text-amber-400 inline-block px-3 py-1 border-[3px] border-black neo-shadow-sm -rotate-1"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{ad.price}</span>
            <meta itemProp="priceCurrency" content="BRL" />
          </p>
        </div>

        <section className="neo-card-white bento-desc space-y-3">
          <h2 className="label-field mb-0">Descrição</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-black" itemProp="description">
            {ad.desc}
          </p>
        </section>

        <AdShareTools ad={ad} adUrl={adUrl} />

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        {(hasPayment || ad.phone) && (
          <section className="neo-card-white bento-actions space-y-4" aria-label="Ações de contato e pagamento">
            {hasPayment && (
              <>
                <div className="rounded-lg border-[3px] border-black bg-amber-500 px-4 py-3 neo-shadow-sm">
                  <h2 className="text-base font-black uppercase text-black">Finalizar compra</h2>
                  <p className="text-xs font-bold text-black/70 mt-0.5">Escolha como pagar</p>
                </div>

                {ad.pix && ad.cardLink ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                WhatsApp com vendedor
              </a>
            )}

            {hasPayment && (
              <p className="text-[11px] font-bold text-zinc-600 text-center uppercase tracking-wide">
                Pagamento direto · Sem intermediação
              </p>
            )}
          </section>
        )}

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        <aside className="neo-card-muted text-center space-y-4 py-8">
          <h3 className="text-base font-black uppercase text-black">Venda em segundos</h3>
          <p className="text-sm font-bold text-black/70 max-w-xs mx-auto">Grátis. Sem cadastro. Só mostarda e raio.</p>
          <button type="button" onClick={onCreateOwn} id="btn-buyer-create-own-ad" className="btn-accent text-base !py-4 !px-8">
            Criar meu anúncio
          </button>
        </aside>
      </div>
    </motion.article>
  );
}
