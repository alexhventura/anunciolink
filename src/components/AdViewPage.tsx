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

  return (
    <motion.article
      key="ad-screen"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg mx-auto px-1 pb-12 space-y-8"
      itemScope
      itemType="https://schema.org/Product"
    >
      <AdSenseSlot slot="topo" ready={adsenseReady} />

      {/* Produto — landing limpa */}
      <div className="card overflow-hidden">
        <div className="ad-card__image w-full overflow-hidden bg-zinc-100 border-b border-zinc-200/80">
          <AdImage
            src={ad.img}
            alt={ad.title}
            type={ad.t}
            title={ad.title}
            printMode={ad.printMode}
            priority
          />
        </div>

        <div className="ad-card__body p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="chip">Disponível</span>
              {ad.billingType === "recorrente" && (
                <span className="text-[11px] font-medium text-zinc-500">Cobrança recorrente</span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 leading-snug" itemProp="name">
              {ad.title}
            </h1>
            <p
              className="text-3xl sm:text-4xl font-bold text-amber-600 tracking-tight min-h-[40px]"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span itemProp="price">{ad.price}</span>
              <meta itemProp="priceCurrency" content="BRL" />
            </p>
          </div>

          <section className="border-t border-zinc-100 pt-6 space-y-3 min-h-[100px]">
            <h2 className="text-xs font-medium uppercase text-zinc-400 tracking-wide">Descrição</h2>
            <p
              className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap font-normal"
              itemProp="description"
            >
              {ad.desc}
            </p>
          </section>
        </div>
      </div>

      <AdSenseSlot slot="meio" ready={adsenseReady} />

      {/* Ações — destaque principal */}
      <section className="ad-actions space-y-3" aria-label="Ações de contato e pagamento">
        {hasPayment && (
          <p className="text-xs font-medium text-zinc-500 text-center mb-1">Formas de pagamento</p>
        )}

        {ad.pix && ad.cardLink ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyPix}
              id="btn-buyer-pix-split"
              aria-live="polite"
              className={`btn-payment-pix w-full ${pixCopied ? "border-amber-500 bg-amber-50 text-amber-900" : ""}`}
            >
              {pixCopied ? "Pix copiado" : "Copiar Pix"}
            </button>
            <a
              href={ad.cardLink}
              target="_blank"
              rel="noopener noreferrer"
              id="link-buyer-card-split"
              className="btn-payment-card w-full"
            >
              Pagar no cartão
            </a>
          </div>
        ) : ad.pix ? (
          <button
            type="button"
            onClick={handleCopyPix}
            id="btn-buyer-pix-full"
            aria-live="polite"
            className={`btn-payment-pix w-full ${pixCopied ? "border-amber-500 bg-amber-50 text-amber-900" : ""}`}
          >
            {pixCopied ? "Código Pix copiado" : "Copiar código Pix"}
          </button>
        ) : ad.cardLink ? (
          <a
            href={ad.cardLink}
            target="_blank"
            rel="noopener noreferrer"
            id="link-buyer-card-full"
            className="btn-payment-card w-full"
          >
            Pagar no cartão de crédito
          </a>
        ) : null}

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
          <p className="text-[11px] text-zinc-400 text-center leading-relaxed pt-2 font-normal px-2">
            Pagamento e entrega são acordados diretamente entre comprador e vendedor.
          </p>
        )}
      </section>

      <AdSenseSlot slot="rodape" ready={adsenseReady} />

      <aside className="card-muted p-8 text-center space-y-4">
        <h3 className="font-display text-base font-bold text-zinc-900">Venda algo em segundos</h3>
        <p className="text-sm text-zinc-500 font-normal max-w-xs mx-auto">
          Crie seu anúncio grátis, com Pix e link compartilhável.
        </p>
        <button type="button" onClick={onCreateOwn} id="btn-buyer-create-own-ad" className="btn-accent">
          Criar meu anúncio
        </button>
      </aside>
    </motion.article>
  );
}
