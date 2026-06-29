import type { AdType, AdThemeId, BillingType } from "../types/ad";
import { resolveAdIcon } from "../lib/adIcons";
import { resolveAdTheme } from "../lib/adThemes";

interface AdBentoHeroProps {
  adType: AdType;
  title: string;
  price: string;
  icon?: string;
  theme?: AdThemeId;
  billingType?: BillingType;
  size?: "card" | "lg";
  className?: string;
}

/** Bloco Bento — gradiente + emoji + título + preço */
export function AdBentoHero({
  adType,
  title,
  price,
  icon,
  theme,
  billingType = "unico",
  size = "card",
  className = "",
}: AdBentoHeroProps) {
  const themeDef = resolveAdTheme(theme);
  const emoji = resolveAdIcon(icon, adType);
  const priceLabel = price + (billingType === "recorrente" ? " /mês" : "");
  const sizeClass = size === "lg" ? "ad-bento-hero--lg" : "ad-bento-hero--card";

  return (
    <div
      className={`ad-bento-hero ${themeDef.gradientClass} ${sizeClass} ${className}`}
      role="img"
      aria-label={`${title || "Anúncio"} — ${priceLabel || "—"}`}
    >
      <div className="ad-bento-hero__glow" aria-hidden="true" />
      <span className="ad-bento-hero__emoji" aria-hidden="true">
        {emoji}
      </span>
      <div className={`ad-bento-hero__copy ${themeDef.textClass}`}>
        <h3
          className="ad-bento-hero__title break-words [overflow-wrap:anywhere]"
          itemProp="name"
        >
          {title || "Título do anúncio"}
        </h3>
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
