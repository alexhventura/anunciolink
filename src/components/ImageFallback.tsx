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
      className="flex h-full w-full flex-col items-center justify-center bg-amber-100 p-8 text-center border-b-[3px] border-black"
      role="img"
      aria-label={`Imagem indisponível: ${title || "Sem título"}`}
    >
      <span className="chip-accent mb-3">{typeLabel[type]}</span>
      <p className="text-sm font-bold text-black line-clamp-2 max-w-[200px]">
        {title || "Sem imagem"}
      </p>
    </div>
  );
}
