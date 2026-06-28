import type { AdType } from "../types/ad";

interface ImageFallbackProps {
  title: string;
  type: AdType;
}

const typeLabel: Record<AdType, string> = {
  venda: "Venda",
  servico: "Serviço",
  vaquinha: "Vaquinha",
};

export function ImageFallback({ title, type }: ImageFallbackProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-zinc-100/80 p-8 text-center"
      role="img"
      aria-label={`Imagem indisponível: ${title || "Sem título"}`}
    >
      <span className="chip mb-4">{typeLabel[type]}</span>
      <p className="font-display text-sm font-semibold text-zinc-800 line-clamp-2 max-w-[200px]">
        {title || "Sem imagem"}
      </p>
    </div>
  );
}
