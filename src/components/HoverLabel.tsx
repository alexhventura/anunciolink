import type { ReactNode } from "react";

interface HoverLabelProps {
  label: string;
  children: ReactNode;
  className?: string;
  /** above | below — posição do popup */
  placement?: "above" | "below";
}

/** Envolve botão/ícone e exibe popup com o rótulo completo no hover ou foco */
export function HoverLabel({
  label,
  children,
  className = "",
  placement = "below",
}: HoverLabelProps) {
  const placementClass =
    placement === "above" ? "hover-label-wrap--above" : "hover-label-wrap--below";

  return (
    <span className={`hover-label-wrap ${placementClass} ${className}`.trim()}>
      <span className="hover-label-wrap__popup" role="tooltip">
        {label}
      </span>
      {children}
    </span>
  );
}
