import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { AD_THEMES } from "../lib/adThemes";
import type { AdThemeId } from "../types/ad";
import { FieldLabelWithHint } from "./HelpTooltip";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";

interface ThemePickerProps {
  value: AdThemeId;
  onChange: (theme: AdThemeId) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  const [focusIndex, setFocusIndex] = useState(() =>
    Math.max(0, AD_THEMES.findIndex((t) => t.id === value))
  );
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusItem = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, AD_THEMES.length - 1));
    setFocusIndex(clamped);
    itemRefs.current[clamped]?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusItem(focusIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusItem(focusIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(AD_THEMES.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (AD_THEMES[focusIndex]) onChange(AD_THEMES[focusIndex].id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="theme-picker space-y-3" role="group" aria-labelledby="theme-picker-label">
      <FieldLabelWithHint hint={TOOLTIP_COPY.theme} fieldLabel="Tema visual" className="mb-0">
        <span id="theme-picker-label">Tema visual</span>
      </FieldLabelWithHint>

      <div
        className="theme-picker__grid"
        role="listbox"
        aria-label="Escolha um tema visual"
        onKeyDown={handleKeyDown}
      >
        {AD_THEMES.map((theme, index) => (
          <button
            key={theme.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="option"
            aria-selected={value === theme.id}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => onChange(theme.id)}
            onFocus={() => setFocusIndex(index)}
            className={`theme-picker__option ${value === theme.id ? "theme-picker__option--active" : ""}`}
            aria-label={`Tema ${theme.label}`}
          >
            <span className={`theme-picker__swatch ad-theme-gradient--${theme.id}`} aria-hidden="true" />
            <span className="theme-picker__label">{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
