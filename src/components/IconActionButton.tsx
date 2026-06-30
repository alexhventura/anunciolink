import type { LucideIcon } from "lucide-react";

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

/** Botão quadrado só com ícone — rótulo no hover/toque (tooltip CSS) */
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

  return (
    <div className={`icon-action-btn-wrap ${className}`.trim()}>
      <span className="icon-action-btn-wrap__tip" role="tooltip">
        {busy ? `${label} — aguarde` : label}
      </span>
      <button
        type="button"
        id={id}
        onClick={onClick}
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label={busy ? `${label} — aguarde` : label}
        className={`icon-action-btn ${variantClass}`.trim()}
      >
        <Icon className="icon-action-btn__icon" strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}
