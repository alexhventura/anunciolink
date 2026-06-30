import { Search } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { AdType } from "../types/ad";
import type { AdIconId } from "../lib/adIcons";
import {
  AD_ICON_CATEGORIES,
  AdIconCategoryId,
  getAdIconDefinition,
  resolveAdIconId,
  searchAdIcons,
} from "../lib/adIcons";
import { AdProductIcon } from "./AdProductIcon";
import { FieldLabelWithHint } from "./HelpTooltip";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";

interface IconPickerProps {
  adType: AdType;
  value: AdIconId;
  onChange: (iconId: AdIconId) => void;
}

export function IconPicker({ adType, value, onChange }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState<AdIconCategoryId>(AdIconCategoryId.Geral);
  const [query, setQuery] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const panelId = useId();
  const selected = resolveAdIconId(value, adType);
  const selectedDef = getAdIconDefinition(selected);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const icons = useMemo(() => {
    if (query.trim()) return searchAdIcons(query);
    return searchAdIcons("", activeCategory);
  }, [activeCategory, query]);

  const focusItem = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, icons.length - 1));
    setFocusIndex(clamped);
    itemRefs.current[clamped]?.focus();
  }, [icons.length]);

  const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (icons.length === 0) return;

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
        focusItem(icons.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (icons[focusIndex]) onChange(icons[focusIndex].id);
        break;
      default:
        break;
    }
  };

  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>, categoryId: AdIconCategoryId) => {
    const idx = AD_ICON_CATEGORIES.findIndex((c) => c.id === categoryId);
    if (idx < 0) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = AD_ICON_CATEGORIES[(idx + 1) % AD_ICON_CATEGORIES.length];
      setActiveCategory(next.id);
      setFocusIndex(0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = AD_ICON_CATEGORIES[(idx - 1 + AD_ICON_CATEGORIES.length) % AD_ICON_CATEGORIES.length];
      setActiveCategory(prev.id);
      setFocusIndex(0);
    }
  };

  return (
    <div className="emoji-picker space-y-3" role="group" aria-labelledby="icon-picker-label">
      <FieldLabelWithHint hint={TOOLTIP_COPY.icon} fieldLabel="Ícone do produto" className="mb-0">
        <span id="icon-picker-label">Ícone do produto</span>
      </FieldLabelWithHint>

      <div className="emoji-picker__preview" aria-live="polite">
        <AdProductIcon
          iconId={selected}
          adType={adType}
          size={44}
          strokeWidth={2.25}
          className="emoji-picker__preview-icon shrink-0 text-zinc-900"
        />
        <p className="emoji-picker__preview-label">Prévia do ícone no card</p>
        {selectedDef && (
          <span className="sr-only">Ícone selecionado: {selectedDef.label}</span>
        )}
      </div>

      <label className="emoji-picker__search">
        <span className="sr-only">Buscar ícone</span>
        <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocusIndex(0);
          }}
          placeholder="Buscar ícone (ex.: celular, pet, pizza…)"
          className="emoji-picker__search-input"
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar ícone por nome"
        />
      </label>

      {!query.trim() && (
        <div className="emoji-picker__tabs" role="tablist" aria-label="Categorias de ícones">
          {AD_ICON_CATEGORIES.map((category) => {
            const tabId = `icon-tab-${category.id}`;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  setActiveCategory(category.id);
                  setFocusIndex(0);
                }}
                onKeyDown={(e) => handleTabKeyDown(e, category.id)}
                className={`emoji-picker__tab ${isActive ? "emoji-picker__tab--active" : ""}`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        id={panelId}
        role="tabpanel"
        aria-label={
          query.trim()
            ? "Resultados da busca de ícones"
            : `Ícones — ${AD_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "categoria"}`
        }
      >
        <div
          className="emoji-picker__grid"
          role="listbox"
          aria-label="Escolha um ícone"
          onKeyDown={handleGridKeyDown}
        >
          {icons.length === 0 ? (
            <p className="emoji-picker__empty">Nenhum ícone encontrado.</p>
          ) : (
            icons.map((def, index) => (
              <button
                key={def.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="option"
                aria-selected={selected === def.id}
                aria-label={`Selecionar ${def.label}`}
                title={def.label}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => onChange(def.id)}
                onFocus={() => setFocusIndex(index)}
                className={`emoji-picker__item ${selected === def.id ? "emoji-picker__item--selected" : ""}`}
              >
                <AdProductIcon iconId={def.id} adType={adType} size={22} strokeWidth={2.25} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
