import type { AdType } from "../types/ad";
import { resolveAdIcon } from "../lib/adIcons";
import { resolveRenderableImageSrc } from "../lib/imageUtils";
import { AdProductThumb } from "./AdProductThumb";

interface AdProductIconProps {
  icon?: string;
  /** URL externa (https) ou data URL legada */
  image?: string;
  adType: AdType;
  title: string;
  priority?: boolean;
  size?: "card" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  card: "ad-product-icon--card",
  sm: "ad-product-icon--sm",
  md: "ad-product-icon--md",
  lg: "ad-product-icon--lg",
  xl: "ad-product-icon--xl",
} as const;

/** Foto via link ou ícone emoji — prioriza imagem quando disponível */
export function AdProductIcon({
  icon,
  image,
  adType,
  title,
  priority = false,
  size = "card",
  className = "",
}: AdProductIconProps) {
  const resolvedImage = resolveRenderableImageSrc(image);

  if (resolvedImage) {
    return (
      <AdProductThumb
        src={resolvedImage}
        alt={title || "Produto"}
        type={adType}
        title={title}
        priority={priority}
        size={size}
        className={className}
      />
    );
  }

  const emoji = resolveAdIcon(icon, adType);

  return (
    <div
      className={`ad-product-icon ${SIZE_CLASS[size]} ${className}`}
      role="img"
      aria-label={`Ícone: ${title || "Produto"}`}
    >
      <span className="ad-product-icon__emoji" aria-hidden="true">
        {emoji}
      </span>
    </div>
  );
}
