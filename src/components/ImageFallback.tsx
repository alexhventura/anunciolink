import type { AdType } from "../types/ad";
import { SITE_DOMAIN } from "../lib/constants";

interface ImageFallbackProps {
  title: string;
  type: AdType;
}

export function ImageFallback({ title, type }: ImageFallbackProps) {
  const emoji = {
    venda: "🏷️",
    servico: "🛠️",
    vaquinha: "💝",
  }[type];

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-6 text-center select-none"
      role="img"
      aria-label={`Imagem indisponível: ${title || "Sem título"}`}
    >
      <span className="text-5xl mb-2" aria-hidden="true">{emoji}</span>
      <p className="font-display text-xs font-extrabold text-zinc-950 line-clamp-2 px-4 uppercase tracking-tight">
        {title || "Sem título definido"}
      </p>
      <p className="mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-widest font-mono">
        {SITE_DOMAIN}
      </p>
    </div>
  );
}
