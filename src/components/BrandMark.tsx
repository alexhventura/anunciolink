import { Zap } from "lucide-react";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  variant?: "bold" | "soft";
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", letter: "text-sm", zap: "h-3.5 w-3.5 -right-1.5 -top-1.5" },
  md: { box: "h-10 w-10", letter: "text-base", zap: "h-4 w-4 -right-1.5 -top-1.5" },
  lg: { box: "h-12 w-12", letter: "text-xl", zap: "h-5 w-5 -right-2 -top-2" },
};

/** Assinatura visual AnúncioLink — A com raio */
export function BrandMark({ size = "md", variant = "bold", className = "" }: BrandMarkProps) {
  const s = sizes[size];
  const isSoft = variant === "soft";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-md ${
        isSoft
          ? "border border-zinc-300 bg-white shadow-sm"
          : "border-2 border-zinc-900 bg-amber-400 shadow-[2px_2px_0_0_#18181b]"
      } ${s.box} ${className}`}
      aria-label="AnúncioLink"
    >
      <span className={`font-black leading-none text-zinc-900 select-none ${s.letter}`}>A</span>
      <Zap
        className={`absolute ${s.zap}`}
        fill="#f59e0b"
        stroke={isSoft ? "#52525b" : "#18181b"}
        strokeWidth={isSoft ? 2 : 2.5}
        aria-hidden="true"
      />
    </span>
  );
}
