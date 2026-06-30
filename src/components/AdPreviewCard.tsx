import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import type { AdIconId } from "../lib/adIcons";
import type { AdType, AdThemeId, BillingType } from "../types/ad";
import { resolveAdTheme } from "../lib/adThemes";
import { formatPhoneNumber } from "../lib/formatters";
import { AdBentoHero } from "./AdBentoHero";
import { SecurityBadge } from "./SecurityBadge";

const TYPE_LABEL: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

interface AdPreviewCardProps {
  adType: AdType;
  title: string;
  price: string;
  description: string;
  icon?: AdIconId;
  theme?: AdThemeId;
  billingType?: BillingType;
  phone?: string;
  showSecurityBadge?: boolean;
  exportMode?: boolean;
  qrSlot?: ReactNode;
  premium?: boolean;
  /** Tipografia ampliada e h1 — página do comprador */
  landing?: boolean;
  className?: string;
}

/** Landing page Bento — ícone + tema + dados do anúncio */
export function AdPreviewCard({
  adType,
  title,
  price,
  description,
  icon,
  theme,
  billingType = "unico",
  phone,
  showSecurityBadge = false,
  exportMode = false,
  qrSlot,
  premium = false,
  landing = false,
  className = "",
}: AdPreviewCardProps) {
  const themeDef = resolveAdTheme(theme);
  const phoneDisplay = phone ? formatPhoneNumber(phone) : "";

  return (
    <div
      className={`ad-preview-card neo-card-white overflow-hidden min-w-0 ${
        premium ? "ad-preview-card--premium" : ""
      } ${landing ? "ad-preview-card--landing" : ""} ${exportMode ? "ad-preview-card--export" : ""} ${className}`}
    >
      {showSecurityBadge && (
        <div className="flex justify-center px-4 pt-4 pb-0 bg-white">
          <SecurityBadge />
        </div>
      )}

      <AdBentoHero
        adType={adType}
        title={title}
        price={price}
        icon={icon}
        theme={theme}
        billingType={billingType}
        size={landing ? "lg" : "card"}
        headingLevel={landing ? "h1" : "h3"}
      />

      <div className={`ad-preview-card__body p-6 sm:p-8 min-w-0 bg-amber-500 ${landing ? "ad-preview-card__body--landing" : "space-y-3"}`}>
        <p className="ad-preview-card__eyebrow">
          <span className={`chip ${themeDef.chipClass}`}>{TYPE_LABEL[adType]}</span>
        </p>
        <div className={`ad-preview-card__desc ${landing ? "ad-preview-card__desc--landing" : ""}`}>
          <h2 className="sr-only">Descrição do anúncio</h2>
          <p
            className="ad-preview-card__desc-text whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
            itemProp="description"
          >
            {description || "Descrição aparecerá aqui."}
          </p>
        </div>
      </div>

      {exportMode && (phoneDisplay || qrSlot) && (
        <div className="ad-preview-card__export-footer">
          {phoneDisplay && (
            <p className="ad-preview-card__phone">
              <Phone className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span>{phoneDisplay}</span>
            </p>
          )}
          {qrSlot}
        </div>
      )}
    </div>
  );
}
