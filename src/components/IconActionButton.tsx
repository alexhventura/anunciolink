import type { LucideIcon } from "lucide-react";
import { HoverLabel } from "./HoverLabel";

interface IconActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "default" | "accent" | "danger" | "ghost" | "primary";
  id?: string;
  className?: string;
}

/** Botão quadrado só com ícone — popup com rótulo no hover/toque */
export function IconActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  busy,
  variant = "default",
  id,
  className = "",
}: IconActionButtonProps) {
  const variantClass =
    variant === "accent"
      ? "icon-action-btn--accent"
      : variant === "danger"
        ? "icon-action-btn--danger"
        : variant === "ghost"
          ? "icon-action-btn--ghost"
          : variant === "primary"
            ? "icon-action-btn--primary"
            : "";

  const tipLabel = busy ? `${label} — aguarde` : label;

  return (
    <HoverLabel label={tipLabel} className={className} placement="above">
      <button
        type="button"
        id={id}
        onClick={onClick}
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label={tipLabel}
        title={tipLabel}
        className={`icon-action-btn ${variantClass}`.trim()}
      >
        <Icon className="icon-action-btn__icon" strokeWidth={2.25} aria-hidden="true" />
      </button>
    </HoverLabel>
  );
}
