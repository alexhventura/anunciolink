import type { AdType } from "../types/ad";
import { AdProductThumb } from "./AdProductThumb";

interface AdImageProps {
  src?: string;
  alt: string;
  type: AdType;
  title: string;
  priority?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** @deprecated Use AdProductThumb — mantido para compatibilidade de imports */
export function AdImage({
  src,
  alt,
  type,
  title,
  priority = false,
  size = "md",
  className = "",
}: AdImageProps) {
  return (
    <AdProductThumb
      src={src}
      alt={alt}
      type={type}
      title={title}
      priority={priority}
      size={size}
      className={className}
    />
  );
}
