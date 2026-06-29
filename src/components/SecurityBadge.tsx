import { Lock } from "lucide-react";

interface SecurityBadgeProps {
  className?: string;
  compact?: boolean;
}

/** Selo discreto de confiança — dados criptografados no dispositivo */
export function SecurityBadge({ className = "", compact = false }: SecurityBadgeProps) {
  return (
    <p
      className={`security-badge inline-flex items-center gap-1.5 rounded-md border border-zinc-900/20 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-700 ${className}`}
      role="status"
    >
      <Lock className="h-3 w-3 shrink-0 text-amber-700" strokeWidth={2.5} aria-hidden="true" />
      <span>
        {compact ? "Link seguro" : "Link seguro e criptografado no dispositivo"}
      </span>
    </p>
  );
}
