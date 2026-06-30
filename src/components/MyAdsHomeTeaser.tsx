import type { AppView } from "../types/ad";
import { useAdHistory } from "../hooks/useAdHistory";
import { SiteNavLink } from "./InstitutionalPageLayout";

interface MyAdsHomeTeaserProps {
  onNavigate: (view: AppView) => void;
}

/** Atalho na home para a página completa de anúncios salvos */
export function MyAdsHomeTeaser({ onNavigate }: MyAdsHomeTeaserProps) {
  const { items } = useAdHistory();

  if (items.length === 0) return null;

  const count = items.length;
  const label = count === 1 ? "1 anúncio salvo" : `${count} anúncios salvos`;

  return (
    <section
      className="my-ads-teaser w-full max-w-3xl mx-auto neo-card-white p-5 sm:p-6"
      aria-labelledby="my-ads-teaser-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 id="my-ads-teaser-heading" className="text-display text-base font-black uppercase">
            Meus anúncios
          </h2>
          <p className="mt-1 text-xs font-bold text-zinc-700">
            {label} neste navegador — copie, compartilhe ou gerencie na página dedicada.
          </p>
        </div>
        <SiteNavLink
          view="meus-anuncios"
          onNavigate={onNavigate}
          highlight
          className="my-ads-teaser__link shrink-0"
        >
          Ver todos
        </SiteNavLink>
      </div>
    </section>
  );
}
