import { Zap } from "lucide-react";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", letter: "text-sm", zap: "h-3.5 w-3.5 -right-1.5 -top-1.5" },
  md: { box: "h-10 w-10", letter: "text-base", zap: "h-4 w-4 -right-1.5 -top-1.5" },
  lg: { box: "h-12 w-12", letter: "text-xl", zap: "h-5 w-5 -right-2 -top-2" },
};

/** Assinatura visual AnúncioLink — A com raio */
export function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  const s = sizes[size];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-md border-[3px] border-black bg-amber-400 ${s.box} ${className}`}
      aria-label="AnúncioLink"
    >
      <span className={`font-black leading-none text-black select-none ${s.letter}`}>A</span>
      <Zap
        className={`absolute ${s.zap}`}
        fill="#fbbf24"
        stroke="#000"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
}
