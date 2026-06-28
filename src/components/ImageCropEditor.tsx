import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import {
  CROP_VIEWPORT,
  DEFAULT_CROP,
  exportCropToDataUrl,
  getCropPreviewStyle,
  loadImageElement,
  type CropTransform,
} from "../lib/imageCrop";

interface ImageCropEditorProps {
  src: string;
  crop: CropTransform;
  onCropChange: (crop: CropTransform) => void;
  onCroppedPreview: (dataUrl: string) => void;
  fillWhite?: boolean;
}

export function ImageCropEditor({
  src,
  crop,
  onCropChange,
  onCroppedPreview,
  fillWhite = false,
}: ImageCropEditorProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const exportTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImageElement(src).then((img) => {
      if (!cancelled) setLoadedImg(img);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (exportTimer.current) window.clearTimeout(exportTimer.current);
    exportTimer.current = window.setTimeout(() => {
      exportCropToDataUrl(src, crop, { fillWhite, outputSize: 240 })
        .then(onCroppedPreview)
        .catch(() => {});
    }, 180);
    return () => {
      if (exportTimer.current) window.clearTimeout(exportTimer.current);
    };
  }, [src, crop, fillWhite, onCroppedPreview]);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!viewportRef.current) return;
      viewportRef.current.setPointerCapture(e.pointerId);
      dragRef.current = { x: e.clientX, y: e.clientY, panX: crop.panX, panY: crop.panY };
    },
    [crop.panX, crop.panY]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      onCropChange({
        ...crop,
        panX: dragRef.current.panX + (e.clientX - dragRef.current.x),
        panY: dragRef.current.panY + (e.clientY - dragRef.current.y),
      });
    },
    [crop, onCropChange]
  );

  const handlePointerUp = useCallback((e: PointerEvent) => {
    dragRef.current = null;
    viewportRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const adjustZoom = (delta: number) => {
    const next = Math.min(3, Math.max(1, Math.round((crop.zoom + delta) * 10) / 10));
    onCropChange({ ...crop, zoom: next });
  };

  const previewStyle = loadedImg ? getCropPreviewStyle(loadedImg, crop, CROP_VIEWPORT) : null;

  return (
    <div className="crop-editor space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-700">
        <Move className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Arraste para posicionar · Ajuste o zoom
      </div>

      <div
        ref={viewportRef}
        className="crop-editor__viewport relative mx-auto overflow-hidden rounded-lg border-2 border-zinc-900 bg-zinc-100 touch-none cursor-grab active:cursor-grabbing shadow-[3px_3px_0_0_#18181b]"
        style={{ width: CROP_VIEWPORT, height: CROP_VIEWPORT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="img"
        aria-label="Área de recorte da foto. Arraste para reposicionar."
      >
        {previewStyle && (
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute left-0 top-0 max-w-none select-none pointer-events-none"
            style={{
              width: previewStyle.width,
              height: previewStyle.height,
              transform: previewStyle.transform,
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-zinc-900/20" aria-hidden="true" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => adjustZoom(-0.1)}
          disabled={crop.zoom <= 1}
          className="crop-editor__zoom-btn"
          aria-label="Diminuir zoom"
        >
          <ZoomOut className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={crop.zoom}
          onChange={(e) => onCropChange({ ...crop, zoom: Number(e.target.value) })}
          className="crop-editor__slider flex-1"
          aria-label="Zoom da imagem"
        />
        <button
          type="button"
          onClick={() => adjustZoom(0.1)}
          disabled={crop.zoom >= 3}
          className="crop-editor__zoom-btn"
          aria-label="Aumentar zoom"
        >
          <ZoomIn className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => onCropChange(DEFAULT_CROP)}
          className="text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-800 shrink-0"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
