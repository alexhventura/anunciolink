import { useEffect, useMemo, useRef, useState } from "react";
import type { AdType, CropTransform } from "../types/ad";
import {
  CROP_VIEWPORT,
  DEFAULT_CROP,
  getCropPreviewStyleForContainer,
  loadImageElement,
} from "../lib/imageCrop";
import { ImageFallback } from "./ImageFallback";

interface CroppedAdImageProps {
  src?: string;
  crop?: CropTransform;
  alt: string;
  type: AdType;
  title: string;
  priority?: boolean;
  className?: string;
  /** checkout = página comprador; create = prévia Home */
  variant?: "checkout" | "create";
  fixedContainerSize?: number;
}

export function CroppedAdImage({
  src,
  crop = DEFAULT_CROP,
  alt,
  type,
  title,
  priority = false,
  className = "",
  variant = "checkout",
  fixedContainerSize,
}: CroppedAdImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(fixedContainerSize ?? CROP_VIEWPORT);
  const [naturalImg, setNaturalImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fixedContainerSize) {
      setContainerSize(fixedContainerSize);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setContainerSize(w);
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedContainerSize]);

  useEffect(() => {
    if (!src) {
      setNaturalImg(null);
      setReady(false);
      setError(false);
      return;
    }

    setReady(false);
    setError(false);
    let cancelled = false;

    loadImageElement(src)
      .then((img) => {
        if (!cancelled) {
          setNaturalImg(img);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  const frameStyle = useMemo(() => {
    if (!naturalImg || !ready) return null;
    return getCropPreviewStyleForContainer(naturalImg, crop, containerSize);
  }, [naturalImg, crop, containerSize, ready]);

  if (!src || error) {
    return (
      <div className={`cropped-ad-image cropped-ad-image--fallback ${className}`}>
        <ImageFallback title={title} type={type} />
      </div>
    );
  }

  const shellClass =
    variant === "checkout"
      ? "cropped-ad-image cropped-ad-image--checkout"
      : "cropped-ad-image cropped-ad-image--create";

  return (
    <div
      ref={containerRef}
      className={`${shellClass} h-full w-full ${className}`}
    >
      {!ready && (
        <div className="cropped-ad-image__skeleton" aria-hidden="true">
          <span className="cropped-ad-image__skeleton-shimmer" />
        </div>
      )}

      {frameStyle && (
        <img
          src={src}
          alt={alt}
          width={Math.round(frameStyle.width)}
          height={Math.round(frameStyle.height)}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          className={`cropped-ad-image__frame ${ready ? "cropped-ad-image__frame--visible" : ""}`}
          style={{
            width: frameStyle.width,
            height: frameStyle.height,
            transform: frameStyle.transform,
          }}
        />
      )}
    </div>
  );
}
