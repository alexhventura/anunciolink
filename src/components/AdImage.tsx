import type { AdType, CropTransform } from "../types/ad";
import { CroppedAdImage } from "./CroppedAdImage";
import { ImageFallback } from "./ImageFallback";

interface AdImageProps {
  src?: string;
  crop?: CropTransform;
  alt: string;
  type: AdType;
  title: string;
  printMode?: boolean;
  priority?: boolean;
  className?: string;
  variant?: "checkout" | "create";
}

export function AdImage({
  src,
  crop,
  alt,
  type,
  title,
  printMode = false,
  priority = false,
  className = "",
  variant = "checkout",
}: AdImageProps) {
  if (crop || !printMode) {
    return (
      <CroppedAdImage
        src={src}
        crop={crop}
        alt={alt}
        type={type}
        title={title}
        priority={priority}
        className={className}
        variant={variant}
      />
    );
  }

  if (!src) {
    return <ImageFallback title={title} type={type} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={480}
      height={480}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      className={`h-full w-full object-contain bg-white p-4 ${className}`}
    />
  );
}
