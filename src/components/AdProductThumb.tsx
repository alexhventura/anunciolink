import { useEffect, useState } from "react";
import type { AdType } from "../types/ad";
import { ImageFallback } from "./ImageFallback";

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

/** @deprecated Anúncios legados com foto embutida — novos usam AdBentoHero */
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
  const boxClass = `ad-product-thumb ${SIZE_CLASS[size]} ${className}`;
  const canRender = Boolean(src && src.startsWith("data:image/") && !failed);

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
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover object-center rounded-lg"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
