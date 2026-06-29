import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import type { AdType, BillingType } from "../types/ad";
import { formatPhoneNumber } from "../lib/formatters";
import { AdProductIcon } from "./AdProductIcon";
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
  icon?: string;
  /** Legado */
  image?: string;
  billingType?: BillingType;
  phone?: string;
  priority?: boolean;
  showSecurityBadge?: boolean;
  /** Card offline / impressão: telefone + QR no rodapé */
  exportMode?: boolean;
  qrSlot?: ReactNode;
  /** Visual mais destacado para compartilhamento */
  premium?: boolean;
  className?: string;
}

/** Card de anúncio — idêntico na criação, visualização e exportação offline */
export function AdPreviewCard({
  adType,
  title,
  price,
  description,
  icon,
  image,
  billingType = "unico",
  phone,
  priority = false,
  showSecurityBadge = false,
  exportMode = false,
  qrSlot,
  premium = false,
  className = "",
}: AdPreviewCardProps) {
  const priceLabel = price + (billingType === "recorrente" ? " /mês" : "");
  const phoneDisplay = phone ? formatPhoneNumber(phone) : "";

  return (
    <div
      className={`ad-preview-card neo-card-white overflow-hidden min-w-0 ${
        premium ? "ad-preview-card--premium" : ""
      } ${exportMode ? "ad-preview-card--export" : ""} ${className}`}
    >
      {showSecurityBadge && (
        <div className="flex justify-center px-4 pt-4 pb-0 bg-white">
          <SecurityBadge />
        </div>
      )}

      <div className="ad-preview-card__hero">
        <div className="ad-preview-card__hero-inner">
          <AdProductIcon
            icon={icon}
            image={image}
            adType={adType}
            title={title}
            priority={priority}
            size="card"
            className="mx-auto"
          />
        </div>
      </div>

      <div className="ad-preview-card__body p-6 sm:p-8 space-y-3 min-w-0">
        <span className="chip !bg-black !text-amber-400">{TYPE_LABEL[adType]}</span>
        <h3
          className="text-xl font-black text-black leading-snug break-words [overflow-wrap:anywhere]"
          itemProp="name"
        >
          {title || "Título do anúncio"}
        </h3>
        <p
          className="text-xl sm:text-2xl md:text-3xl font-black text-black bg-white border-[3px] border-black inline-block max-w-full px-3 py-1 neo-shadow-sm tabular-nums break-words [overflow-wrap:anywhere]"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="price">{priceLabel || "—"}</span>
          <meta itemProp="priceCurrency" content="BRL" />
        </p>
        <p
          className="text-sm text-black/80 font-medium whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed"
          itemProp="description"
        >
          {description || "Descrição aparecerá aqui."}
        </p>
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
