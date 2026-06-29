import { AD_THEMES } from "../lib/adThemes";
import type { AdThemeId } from "../types/ad";
import { FieldLabelWithHint } from "./HelpTooltip";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";

interface ThemePickerProps {
  value: AdThemeId;
  onChange: (theme: AdThemeId) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="theme-picker space-y-3">
      <FieldLabelWithHint hint={TOOLTIP_COPY.theme} className="mb-0">
        <span>Tema visual</span>
      </FieldLabelWithHint>

      <div className="theme-picker__grid" role="listbox" aria-label="Escolha um tema visual">
        {AD_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            role="option"
            aria-selected={value === theme.id}
            onClick={() => onChange(theme.id)}
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
