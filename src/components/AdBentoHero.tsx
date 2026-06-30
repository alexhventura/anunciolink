import type { AdType, AdThemeId, BillingType } from "../types/ad";
import type { AdIconId } from "../lib/adIcons";
import { resolveAdIconId } from "../lib/adIcons";
import { resolveAdTheme } from "../lib/adThemes";
import { AdProductIcon } from "./AdProductIcon";

interface AdBentoHeroProps {
  adType: AdType;
  title: string;
  price: string;
  icon?: AdIconId;
  theme?: AdThemeId;
  billingType?: BillingType;
  size?: "card" | "lg";
  /** h1 na landing do comprador; h3 na prévia */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}

/** Bloco Bento — gradiente + ícone + título + preço */
export function AdBentoHero({
  adType,
  title,
  price,
  icon,
  theme,
  billingType = "unico",
  size = "card",
  headingLevel = "h3",
  className = "",
}: AdBentoHeroProps) {
  const themeDef = resolveAdTheme(theme);
  const iconId = resolveAdIconId(icon, adType);
  const iconSize = size === "lg" ? 88 : headingLevel === "h1" ? 80 : 72;
  const iconColor = themeDef.id === "amber" || themeDef.id === "minimal" ? "#18181b" : "#ffffff";
  const priceLabel = price + (billingType === "recorrente" ? " /mês" : "");
  const sizeClass = size === "lg" ? "ad-bento-hero--lg" : "ad-bento-hero--card";
  const landingClass = headingLevel === "h1" ? " ad-bento-hero--landing" : "";
  const TitleTag = headingLevel;

  return (
    <div
      className={`ad-bento-hero ${themeDef.gradientClass} ${sizeClass}${landingClass} ${className}`}
    >
      <div className="ad-bento-hero__glow" aria-hidden="true" />
      <AdProductIcon
        iconId={iconId}
        adType={adType}
        size={iconSize}
        color={iconColor}
        className="ad-bento-hero__emoji"
      />
      <div className={`ad-bento-hero__copy ${themeDef.textClass}`}>
        <TitleTag
          className="ad-bento-hero__title break-words [overflow-wrap:anywhere]"
          itemProp="name"
        >
          {title || "Título do anúncio"}
        </TitleTag>
        <p
          className={`ad-bento-hero__price ${themeDef.priceClass} tabular-nums break-words [overflow-wrap:anywhere]`}
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
