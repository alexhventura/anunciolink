import { useId, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";

interface HelpTooltipProps {
  text: string;
  /** Posição do balão em relação ao ícone */
  placement?: "top" | "bottom";
  /** Variante visual para fundos escuros (botões) */
  variant?: "default" | "on-dark";
}

export function HelpTooltip({ text, placement = "top", variant = "default" }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const toggle = (e: MouseEvent | PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  return (
    <span
      className={`help-tooltip group/hint relative inline-flex shrink-0 ${open ? "help-tooltip--open" : ""}`}
    >
      <button
        type="button"
        className={`help-tooltip__trigger ${variant === "on-dark" ? "help-tooltip__trigger--on-dark" : ""}`}
        aria-label="Ver instrução"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={toggle}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true">!</span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`help-tooltip__bubble help-tooltip__bubble--${placement} ${
          variant === "on-dark" ? "help-tooltip__bubble--on-dark" : ""
        }`}
      >
        {text}
      </span>
    </span>
  );
}

interface FieldLabelWithHintProps {
  htmlFor?: string;
  hint: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

/** Label de formulário com ícone de instrução ao lado */
export function FieldLabelWithHint({
  htmlFor,
  hint,
  className = "",
  labelClassName = "label-field mb-0",
  children,
}: FieldLabelWithHintProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClassName}>
          {children}
        </label>
      ) : (
        <span className={labelClassName}>{children}</span>
      )}
      <HelpTooltip text={hint} placement="top" />
    </span>
  );
}

interface FieldLegendWithHintProps {
  hint: string;
  children: ReactNode;
}

/** Legenda de fieldset com ícone de instrução ao lado */
export function FieldLegendWithHint({ hint, children }: FieldLegendWithHintProps) {
  return (
    <legend className="label-field inline-flex items-center gap-1.5 flex-wrap w-full mb-0">
      {children}
      <HelpTooltip text={hint} placement="top" />
    </legend>
  );
}

interface ActionButtonWithHintProps {
  hint: string;
  hintVariant?: "default" | "on-dark";
  children: ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  "aria-busy"?: boolean;
  "aria-live"?: "polite" | "off" | "assertive";
}

/** Botão de ação com tooltip no canto — toque no ! não dispara o clique principal */
export function ActionButtonWithHint({
  hint,
  hintVariant = "on-dark",
  children,
  className = "",
  id,
  disabled,
  type = "button",
  onClick,
  "aria-busy": ariaBusy,
  "aria-live": ariaLive,
}: ActionButtonWithHintProps) {
  return (
    <span className="action-btn-hint relative block w-full">
      <button
        type={type}
        id={id}
        className={className}
        disabled={disabled}
        onClick={onClick}
        aria-busy={ariaBusy}
        aria-live={ariaLive}
      >
        {children}
      </button>
      <span className="action-btn-hint__icon">
        <HelpTooltip text={hint} placement="top" variant={hintVariant} />
      </span>
    </span>
  );
}
