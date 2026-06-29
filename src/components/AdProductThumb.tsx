import type { AdType } from "../types/ad";
import { ImageFallback } from "./ImageFallback";

interface AdProductThumbProps {
  src?: string;
  alt: string;
  type: AdType;
  title: string;
  priority?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const SIZE_CLASS = {
  sm: "w-32 h-32",
  md: "w-40 h-40",
} as const;

/** Foto do produto — quadrado fixo, centralizado, object-cover */
export function AdProductThumb({
  src,
  alt,
  type,
  title,
  priority = false,
  size = "md",
  className = "",
}: AdProductThumbProps) {
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
        width={size === "sm" ? 128 : 160}
        height={size === "sm" ? 128 : 160}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
