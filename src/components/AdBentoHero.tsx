import type { AdType, BillingType } from "../types/ad";
import type { AdIconId } from "../lib/adIcons";
import { resolveAdIconId } from "../lib/adIcons";
import { AdProductIcon } from "./AdProductIcon";

interface AdBentoHeroProps {
  adType: AdType;
  title: string;
  price: string;
  icon?: AdIconId;
  billingType?: BillingType;
  size?: "card" | "lg";
  /** h1 na landing do comprador; h3 na prévia */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}

/** Bloco Bento — mostarda, ícone em fundo branco, preço preto */
export function AdBentoHero({
  adType,
  title,
  price,
  icon,
  billingType = "unico",
  size = "card",
  headingLevel = "h3",
  className = "",
}: AdBentoHeroProps) {
  const iconId = resolveAdIconId(icon, adType);
  const iconSize = size === "lg" ? 88 : headingLevel === "h1" ? 80 : 72;
  const priceLabel = price + (billingType === "recorrente" ? " /mês" : "");
  const sizeClass = size === "lg" ? "ad-bento-hero--lg" : "ad-bento-hero--card";
  const landingClass = headingLevel === "h1" ? " ad-bento-hero--landing" : "";
  const TitleTag = headingLevel;

  return (
    <div className={`ad-bento-hero ad-bento-hero--brand ${sizeClass}${landingClass} ${className}`}>
      <div className="ad-bento-hero__glow" aria-hidden="true" />
      <div className="ad-bento-hero__icon-well">
        <AdProductIcon
          iconId={iconId}
          adType={adType}
          size={iconSize}
          color="#18181b"
          className="ad-bento-hero__emoji"
        />
      </div>
      <div className="ad-bento-hero__copy">
        <TitleTag
          className="ad-bento-hero__title text-zinc-900 break-words [overflow-wrap:anywhere]"
          itemProp="name"
        >
          {title || "Título do anúncio"}
        </TitleTag>
        <p
          className="ad-bento-hero__price text-zinc-900 tabular-nums break-words [overflow-wrap:anywhere]"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="price">{priceLabel || "—"}</span>
          <meta itemProp="priceCurrency" content="BRL" />
        </p>
      </div>
    </div>
  );
}
