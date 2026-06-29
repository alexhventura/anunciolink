import type { AdType } from "../types/ad";
import { ImageFallback } from "./ImageFallback";

interface AdProductThumbProps {
  src?: string;
  alt: string;
  type: AdType;
  title: string;
  priority?: boolean;
  size?: "card" | "sm" | "md";
  className?: string;
}

const SIZE_CLASS = {
  card: "w-[150px] h-[150px]",
  sm: "w-32 h-32",
  md: "w-40 h-40",
} as const;

const SIZE_PX = {
  card: 150,
  sm: 128,
  md: 160,
} as const;

/** Foto do produto — quadrado fixo, centralizado, object-cover */
export function AdProductThumb({
  src,
  alt,
  type,
  title,
  priority = false,
  size = "card",
  className = "",
}: AdProductThumbProps) {
  const px = SIZE_PX[size];
  const boxClass = `ad-product-thumb ${SIZE_CLASS[size]} ${className}`;

  if (!src) {
    return (
      <div className={`${boxClass} ad-product-thumb--empty`}>
        <ImageFallback title={title} type={type} />
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <img
        src={src}
        alt={alt}
        width={px}
        height={px}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover rounded-lg"
      />
    </div>
  );
}
