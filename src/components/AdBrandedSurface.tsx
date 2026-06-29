import type { ReactNode } from "react";
import { BrandAttributionFooter } from "./BrandAttributionFooter";
import { BrandWatermark } from "./BrandWatermark";

type AdBrandedVariant = "checkout" | "create" | "print";

interface AdBrandedSurfaceProps {
  children: ReactNode;
  variant?: AdBrandedVariant;
  className?: string;
  contentClassName?: string;
  showWatermark?: boolean;
  showFooter?: boolean;
  footerWithPrefix?: boolean;
}

/**
 * Superfície com marca d'água + conteúdo + rodapé fixado na base.
 * Usado no card de prévia, página do comprador e folheto A4.
 */
export function AdBrandedSurface({
  children,
  variant = "checkout",
  className = "",
  contentClassName = "",
  showWatermark = true,
  showFooter = true,
  footerWithPrefix = true,
}: AdBrandedSurfaceProps) {
  return (
    <div className={`ad-branded-surface ad-branded-surface--${variant} ${className}`}>
      {showWatermark && <BrandWatermark variant={variant} />}
      <div className={`ad-branded-surface__content ${contentClassName}`}>{children}</div>
      {showFooter && (
        <BrandAttributionFooter variant={variant} withPrefix={footerWithPrefix} />
      )}
    </div>
  );
}
