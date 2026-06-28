import { useState } from "react";
import type { AdType } from "../types/ad";
import { ImageFallback } from "./ImageFallback";

interface AdImageProps {
  src?: string;
  alt: string;
  type: AdType;
  title: string;
  printMode?: boolean;
  priority?: boolean;
  className?: string;
}

export function AdImage({
  src,
  alt,
  type,
  title,
  printMode = false,
  priority = false,
  className = "",
}: AdImageProps) {
  const [loadError, setLoadError] = useState(false);
  const objectClass = printMode ? "object-contain bg-white p-4" : "object-cover";

  if (!src || loadError) {
    return <ImageFallback title={title} type={type} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={400}
      height={400}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      onError={() => setLoadError(true)}
      className={`h-full w-full ${objectClass} ${className}`}
    />
  );
}
