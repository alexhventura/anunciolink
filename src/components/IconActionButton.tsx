import type { LucideIcon } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";

interface IconActionButtonProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  hintVariant?: "default" | "on-dark";
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "default" | "accent" | "danger" | "ghost";
  id?: string;
  className?: string;
}

/** Botão quadrado só com ícone — toolbar responsiva */
export function IconActionButton({
  icon: Icon,
  label,
  hint,
  hintVariant = "default",
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
          : "";

  return (
    <div className={`icon-action-btn-wrap ${className}`.trim()}>
      <button
        type="button"
        id={id}
        onClick={onClick}
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label={busy ? `${label} — aguarde` : label}
        title={hint ? undefined : label}
        className={`icon-action-btn ${variantClass}`.trim()}
      >
        <Icon className="icon-action-btn__icon" strokeWidth={2.25} aria-hidden="true" />
      </button>
      {hint ? (
        <span className="icon-action-btn-wrap__hint">
          <HelpTooltip text={hint} placement="top" variant={hintVariant} triggerLabel={`Ajuda: ${label}`} />
        </span>
      ) : null}
    </div>
  );
}
