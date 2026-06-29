import type { AdType, BillingType } from "../types/ad";
import { AdProductThumb } from "./AdProductThumb";
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
  image?: string;
  billingType?: BillingType;
  priority?: boolean;
  showPhotoCaption?: boolean;
  showSecurityBadge?: boolean;
  className?: string;
}

/** Card compacto de produto — idêntico na criação e na visualização */
export function AdPreviewCard({
  adType,
  title,
  price,
  description,
  image,
  billingType = "unico",
  priority = false,
  showPhotoCaption = true,
  showSecurityBadge = false,
  className = "",
}: AdPreviewCardProps) {
  const priceLabel = price + (billingType === "recorrente" ? " /mês" : "");

  return (
    <div className={`neo-card-white overflow-hidden ${className}`}>
      {showSecurityBadge && (
        <div className="flex justify-center px-4 pt-4 pb-0 bg-white">
          <SecurityBadge />
        </div>
      )}
      <div className="px-6 pt-6 pb-4 text-center bg-white border-b-[3px] border-black">
        <AdProductThumb
          src={image}
          alt={title || "Produto"}
          type={adType}
          title={title}
          priority={priority}
          size="card"
          className="mx-auto"
        />
        {image && showPhotoCaption && (
          <p className="text-xs font-medium text-zinc-500 mt-3">
            Foto otimizada automaticamente para o link.
          </p>
        )}
      </div>
      <div className="p-6 sm:p-8 space-y-3 bg-amber-500">
        <span className="chip !bg-black !text-amber-400">{TYPE_LABEL[adType]}</span>
        <h3 className="text-xl font-black text-black leading-snug" itemProp="name">
          {title || "Título do anúncio"}
        </h3>
        <p
          className="text-2xl sm:text-3xl font-black text-black bg-white border-[3px] border-black inline-block px-3 py-1 neo-shadow-sm tabular-nums"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="price">{priceLabel || "—"}</span>
          <meta itemProp="priceCurrency" content="BRL" />
        </p>
        <p
          className="text-sm text-black/80 font-medium whitespace-pre-wrap line-clamp-6"
          itemProp="description"
        >
          {description || "Descrição aparecerá aqui."}
        </p>
      </div>
    </div>
  );
}
