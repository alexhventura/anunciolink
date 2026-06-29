import { useMemo, useState } from "react";
import type { AdType } from "../types/ad";
import { AD_ICON_CATEGORIES, resolveAdIcon } from "../lib/adIcons";
import { FieldLabelWithHint } from "./HelpTooltip";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";

interface EmojiPickerProps {
  adType: AdType;
  value: string;
  onChange: (icon: string) => void;
}

export function EmojiPicker({ adType, value, onChange }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(AD_ICON_CATEGORIES[0]?.id ?? "geral");
  const selected = resolveAdIcon(value, adType);

  const icons = useMemo(
    () => AD_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.icons ?? AD_ICON_CATEGORIES[0].icons,
    [activeCategory]
  );

  return (
    <div className="emoji-picker space-y-3">
      <FieldLabelWithHint hint={TOOLTIP_COPY.icon} className="mb-0">
        <span>Ícone do produto</span>
      </FieldLabelWithHint>

      <div className="emoji-picker__preview" aria-live="polite">
        <span className="emoji-picker__preview-emoji" aria-hidden="true">
          {selected}
        </span>
        <p className="emoji-picker__preview-label">Prévia do ícone no card</p>
      </div>

      <div className="emoji-picker__tabs" role="tablist" aria-label="Categorias de ícones">
        {AD_ICON_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`emoji-picker__tab ${activeCategory === category.id ? "emoji-picker__tab--active" : ""}`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="emoji-picker__grid" role="listbox" aria-label="Escolha um ícone">
        {icons.map((icon) => (
          <button
            key={icon}
            type="button"
            role="option"
            aria-selected={selected === icon}
            onClick={() => onChange(icon)}
            className={`emoji-picker__item ${selected === icon ? "emoji-picker__item--selected" : ""}`}
            aria-label={`Selecionar ícone ${icon}`}
          >
            <span aria-hidden="true">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
