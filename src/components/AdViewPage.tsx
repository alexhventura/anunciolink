import { useState } from "react";
import { motion } from "motion/react";
import type { AdData } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { AdImage } from "./AdImage";
import { copyToClipboard } from "../lib/formatters";
import { SITE_DOMAIN } from "../lib/constants";

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

  return (
    <motion.article
      key="ad-screen"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="max-w-md mx-auto text-zinc-900 font-sans antialiased p-1 space-y-6"
      itemScope
      itemType="https://schema.org/Product"
    >
      <AdSenseSlot slot="topo" ready={adsenseReady} />

      <div className="space-y-6">
        <div className="ad-card overflow-hidden rounded-[40px] bg-white shadow-soft-premium border-4 border-amber-600 flex flex-col">
          <div className="ad-card__header px-6 py-4.5 border-b border-zinc-100 flex justify-between items-center bg-white/95 backdrop-blur-sm min-h-[72px]">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">⚡</span>
              <span className="font-extrabold text-zinc-950 tracking-tight text-lg">
                anuncio<span className="text-amber-600">link</span>
                <span className="text-zinc-400 font-medium text-[10px]">.{SITE_DOMAIN.replace("www.", "")}</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-3 py-1 rounded-full shadow-inner-soft">
                Disponível
              </span>
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-tight">
                {ad.billingType === "recorrente" ? "Recorrente/Serviço" : "Cobrança Única"}
              </span>
            </div>
          </div>

          <div className="p-6 pb-0">
            <div className="ad-card__image aspect-square w-full rounded-[32px] overflow-hidden bg-zinc-100 shadow-soft-premium border border-zinc-100/30">
              <AdImage
                src={ad.img}
                alt={ad.title}
                type={ad.t}
                title={ad.title}
                printMode={ad.printMode}
                priority
              />
            </div>
          </div>

          <div className="ad-card__body p-6 space-y-5 min-h-[180px]">
            <div className="space-y-1.5 px-1 text-left">
              <h1 className="text-2xl font-extrabold tracking-tighter text-zinc-950 leading-tight" itemProp="name">
                {ad.title}
              </h1>
              <div
                className="text-4xl font-black text-amber-600 tracking-tighter flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-h-[48px]"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <span itemProp="price">{ad.price}</span>
                <meta itemProp="priceCurrency" content="BRL" />
                {ad.billingType === "recorrente" && (
                  <span className="text-xs font-bold text-zinc-500 font-sans tracking-normal bg-zinc-100 px-2 py-1 rounded-lg">
                    🔄 Recorrente
                  </span>
                )}
              </div>
            </div>

            <section className="bg-zinc-50 rounded-[32px] p-6 shadow-inner-soft border border-zinc-100/50 text-left space-y-2 min-h-[120px]">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Detalhes
              </h2>
              <p className="text-zinc-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium" itemProp="description">
                {ad.desc}
              </p>
            </section>
          </div>
        </div>

        <AdSenseSlot slot="meio" ready={adsenseReady} />

        <section className="ad-actions space-y-4 px-1 min-h-[80px]" aria-label="Ações de contato e pagamento">
          {ad.phone && (
            <a
              href={`https://wa.me/${ad.phone}?text=${encodeURIComponent(
                `Olá! Vi o seu anúncio no Anuncio Link: '${ad.title}'. Gostaria de combinar o envio/pagamento!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-wa-buyer-contact"
              className="flex w-full items-center justify-center gap-3 rounded-3xl bg-[#25D366] hover:bg-[#20bd5c] py-5 px-8 text-center font-display text-base font-bold text-white transition-all active:scale-[0.98] shadow-soft-green min-h-[64px]"
            >
              <span className="text-2xl" aria-hidden="true">💬</span>
              Combinar / Comprar pelo WhatsApp
            </a>
          )}

          {(ad.pix || ad.cardLink) && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-zinc-500 text-center font-medium">Pagar agora:</p>

              {ad.pix && ad.cardLink ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    id="btn-buyer-pix-split"
                    aria-live="polite"
                    className={`py-5 px-6 rounded-3xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-soft-premium border border-zinc-100/50 min-h-[64px] ${
                      pixCopied ? "bg-amber-50 text-amber-800" : "bg-white hover:bg-zinc-50 text-zinc-950"
                    }`}
                  >
                    <span className={`text-xl ${pixCopied ? "text-amber-800" : "text-amber-500"}`} aria-hidden="true">
                      {pixCopied ? "✓" : "⚡"}
                    </span>
                    {pixCopied ? "Pix copiado!" : "Copiar Pix"}
                  </button>

                  <a
                    href={ad.cardLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="link-buyer-card-split"
                    className="py-5 px-6 rounded-3xl bg-zinc-950 hover:bg-black text-white font-bold flex items-center justify-center gap-2.5 shadow-soft-premium active:scale-[0.98] transition-all min-h-[64px]"
                  >
                    <span className="text-xl" aria-hidden="true">💳</span>
                    Pagar no Cartão
                  </a>
                </div>
              ) : ad.pix ? (
                <button
                  type="button"
                  onClick={handleCopyPix}
                  id="btn-buyer-pix-full"
                  aria-live="polite"
                  className={`w-full py-5 px-8 rounded-3xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-soft-premium border border-zinc-100/50 min-h-[64px] ${
                    pixCopied ? "bg-amber-50 text-amber-800" : "bg-white hover:bg-zinc-50 text-zinc-950"
                  }`}
                >
                  <span className={`text-xl ${pixCopied ? "text-amber-800" : "text-amber-500"}`} aria-hidden="true">
                    {pixCopied ? "✓" : "⚡"}
                  </span>
                  {pixCopied ? "Código Pix copiado!" : "Copiar Código Pix Copia e Cola"}
                </button>
              ) : (
                <a
                  href={ad.cardLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="link-buyer-card-full"
                  className="w-full py-5 px-8 rounded-3xl bg-zinc-950 hover:bg-black text-white font-bold flex items-center justify-center gap-2.5 shadow-soft-premium active:scale-[0.98] transition-all min-h-[64px]"
                >
                  <span className="text-xl" aria-hidden="true">💳</span>
                  Pagar no Cartão de Crédito (Parcelado)
                </a>
              )}

              <p className="text-[11px] text-zinc-400 text-center leading-normal px-6 pt-2 font-medium">
                A negociação e pagamento ocorrem diretamente entre as partes. O {SITE_DOMAIN} é apenas um mural de anúncios e não retém valores.
              </p>
            </div>
          )}
        </section>

        <AdSenseSlot slot="rodape" ready={adsenseReady} />

        <aside className="rounded-[40px] border border-amber-100 bg-zinc-50 p-6 text-center space-y-4 shadow-soft-premium min-h-[160px]">
          <h3 className="font-display font-extrabold text-zinc-950 text-base leading-tight">
            Venda seu desapego em segundos!
          </h3>
          <p className="text-xs text-zinc-500 font-semibold max-w-xs mx-auto">
            Crie seu anúncio grátis em menos de 15 segundos. Sem cadastro e sem taxas.
          </p>
          <button
            type="button"
            onClick={onCreateOwn}
            id="btn-buyer-create-own-ad"
            className="cursor-pointer inline-block bg-amber-500 hover:bg-amber-600 text-black text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-soft-premium active:scale-[0.98]"
          >
            Criar meu Anúncio Grátis
          </button>
        </aside>
      </div>
    </motion.article>
  );
}
