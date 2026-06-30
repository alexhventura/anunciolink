import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface HelpTooltipProps {
  text: string;
  placement?: "top" | "bottom";
  variant?: "default" | "on-dark";
  /** Rótulo acessível do botão — contextual para leitores de tela */
  triggerLabel?: string;
}

const VIEWPORT_PAD = 12;
const GAP = 8;
const MAX_BUBBLE_W = 250;

function clampBubbleLeft(centerX: number, bubbleWidth: number): number {
  const half = bubbleWidth / 2;
  const min = VIEWPORT_PAD + half;
  const max = window.innerWidth - VIEWPORT_PAD - half;
  return Math.max(min, Math.min(max, centerX));
}

export function HelpTooltip({
  text,
  placement = "top",
  variant = "default",
  triggerLabel = "Informação adicional",
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [bubbleStyle, setBubbleStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const rect = trigger.getBoundingClientRect();
    const bubbleWidth = Math.min(MAX_BUBBLE_W, window.innerWidth - VIEWPORT_PAD * 2);
    const centerX = clampBubbleLeft(rect.left + rect.width / 2, bubbleWidth);
    const bubbleRect = bubble.getBoundingClientRect();
    const bubbleH = bubbleRect.height || 80;

    if (placement === "bottom") {
      let top = rect.bottom + GAP;
      if (top + bubbleH > window.innerHeight - VIEWPORT_PAD) {
        top = rect.top - GAP - bubbleH;
      }
      setBubbleStyle({
        position: "fixed",
        top: Math.max(VIEWPORT_PAD, top),
        left: centerX,
        transform: "translateX(-50%)",
        width: bubbleWidth,
        maxWidth: `min(${MAX_BUBBLE_W}px, calc(100vw - ${VIEWPORT_PAD * 2}px))`,
        zIndex: 200,
      });
      return;
    }

    let top = rect.top - GAP - bubbleH;
    if (top < VIEWPORT_PAD) {
      top = rect.bottom + GAP;
    }
    setBubbleStyle({
      position: "fixed",
      top: Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - bubbleH - VIEWPORT_PAD)),
      left: centerX,
      transform: "translateX(-50%)",
      width: bubbleWidth,
      maxWidth: `min(${MAX_BUBBLE_W}px, calc(100vw - ${VIEWPORT_PAD * 2}px))`,
      zIndex: 200,
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const raf = requestAnimationFrame(() => reposition());
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, reposition, text]);

  const toggle = (e: MouseEvent | PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const bubbleClass =
    variant === "on-dark" ? "help-tooltip__bubble help-tooltip__bubble--on-dark" : "help-tooltip__bubble";

  return (
    <span className={`help-tooltip group/hint relative inline-flex shrink-0 ${open ? "help-tooltip--open" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`help-tooltip__trigger ${variant === "on-dark" ? "help-tooltip__trigger--on-dark" : ""}`}
        aria-label={triggerLabel}
        aria-describedby={open ? tooltipId : undefined}
        aria-controls={tooltipId}
        aria-expanded={open}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
      >
        <span aria-hidden="true">!</span>
      </button>

      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            id={tooltipId}
            role="tooltip"
            className={bubbleClass}
            style={{ ...bubbleStyle, opacity: 1, visibility: "visible", pointerEvents: "none" }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}

interface FieldLabelWithHintProps {
  htmlFor?: string;
  hint: string;
  fieldLabel?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

export function FieldLabelWithHint({
  htmlFor,
  hint,
  fieldLabel,
  className = "",
  labelClassName = "label-field mb-0",
  children,
}: FieldLabelWithHintProps) {
  const triggerLabel = fieldLabel ? `Ajuda: ${fieldLabel}` : "Informação adicional sobre este campo";

  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClassName}>
          {children}
        </label>
      ) : (
        <span className={labelClassName}>{children}</span>
      )}
      <HelpTooltip text={hint} placement="top" triggerLabel={triggerLabel} />
    </span>
  );
}

interface FieldLegendWithHintProps {
  hint: string;
  fieldLabel?: string;
  children: ReactNode;
}

export function FieldLegendWithHint({ hint, fieldLabel, children }: FieldLegendWithHintProps) {
  const triggerLabel = fieldLabel ? `Ajuda: ${fieldLabel}` : "Informação adicional sobre este campo";

  return (
    <legend className="label-field inline-flex items-center gap-1.5 flex-wrap w-full mb-0">
      {children}
      <HelpTooltip text={hint} placement="top" triggerLabel={triggerLabel} />
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
  "aria-label"?: string;
}

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
  "aria-label": ariaLabel,
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
        aria-label={ariaLabel}
      >
        {children}
      </button>
      <span className="action-btn-hint__icon">
        <HelpTooltip text={hint} placement="top" variant={hintVariant} triggerLabel="Ajuda sobre esta ação" />
      </span>
    </span>
  );
}
