import { useEffect, useState } from "react";
import type { AdType } from "../types/ad";
import { ImageFallback } from "./ImageFallback";
import { isRenderableImageSrc } from "../lib/imageUtils";

interface AdProductThumbProps {
  src?: string;
  alt: string;
  type: AdType;
  title: string;
  priority?: boolean;
  size?: "card" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  card: "w-[150px] h-[150px]",
  sm: "w-32 h-32",
  md: "w-40 h-40",
  lg: "w-56 h-56",
  xl: "w-72 h-72",
} as const;

const SIZE_PX = {
  card: 150,
  sm: 128,
  md: 160,
  lg: 224,
  xl: 288,
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
  const [failed, setFailed] = useState(false);
  const px = SIZE_PX[size];
  const boxClass = `ad-product-thumb ${SIZE_CLASS[size]} ${className}`;
  const canRender = Boolean(src && isRenderableImageSrc(src) && !failed);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!canRender) {
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
        className="h-full w-full object-cover object-center rounded-lg"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
