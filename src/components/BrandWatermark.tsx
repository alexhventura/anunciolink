import { BrandMark } from "./BrandMark";

type BrandWatermarkVariant = "checkout" | "create" | "print";

interface BrandWatermarkProps {
  variant?: BrandWatermarkVariant;
  className?: string;
}

/** Marca d'água discreta — não interfere em cliques ou seleção */
export function BrandWatermark({ variant = "checkout", className = "" }: BrandWatermarkProps) {
  return (
    <div
      className={`brand-watermark brand-watermark--${variant} ${className}`}
      aria-hidden="true"
    >
      <BrandMark
        size="lg"
        variant="soft"
        className="brand-watermark__mark pointer-events-none select-none"
      />
    </div>
  );
}
