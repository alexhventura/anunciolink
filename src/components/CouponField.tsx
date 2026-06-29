import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { MAX_COUPON_CODE_LENGTH, normalizeCouponCode, validateCouponConfig } from "../lib/coupon";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { FieldLabelWithHint, HelpTooltip } from "./HelpTooltip";

interface CouponFieldProps {
  enabled: boolean;
  code: string;
  percent: number;
  onEnabledChange: (enabled: boolean) => void;
  onCodeChange: (code: string) => void;
  onPercentChange: (percent: number) => void;
  error?: string | null;
}

export function CouponField({
  enabled,
  code,
  percent,
  onEnabledChange,
  onCodeChange,
  onPercentChange,
  error,
}: CouponFieldProps) {
  return (
    <div className="rounded-lg border-2 border-zinc-900 bg-white shadow-[3px_3px_0_0_#18181b] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 bg-amber-50">
        <span className="inline-flex items-center gap-2 min-w-0">
          <Tag className="h-4 w-4 text-black shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <span className="text-sm font-bold text-black">Ativar cupom de desconto</span>
          <HelpTooltip text={TOOLTIP_COPY.coupon} placement="top" />
        </span>
        <button
          type="button"
          id="btn-toggle-coupon"
          onClick={() => onEnabledChange(!enabled)}
          aria-expanded={enabled}
          aria-label={enabled ? "Recolher cupom" : "Expandir cupom"}
          className="shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors"
        >
          {enabled ? (
            <ChevronUp className="h-4 w-4 text-zinc-600" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-600" aria-hidden="true" />
          )}
        </button>
      </div>

      {enabled && (
        <div className="px-4 pb-4 pt-3 space-y-4 border-t-2 border-zinc-900 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabelWithHint htmlFor="coupon-code-input" hint={TOOLTIP_COPY.couponCode} className="mb-2">
                Código do cupom
              </FieldLabelWithHint>
              <input
                id="coupon-code-input"
                type="text"
                value={code}
                maxLength={MAX_COUPON_CODE_LENGTH}
                onChange={(e) => onCodeChange(normalizeCouponCode(e.target.value))}
                placeholder="DEZ10"
                className="input-field font-mono text-sm uppercase"
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabelWithHint htmlFor="coupon-percent-input" hint={TOOLTIP_COPY.couponPercent} className="mb-2">
                Desconto (%)
              </FieldLabelWithHint>
              <input
                id="coupon-percent-input"
                type="number"
                min={1}
                max={99}
                value={percent}
                onChange={(e) => onPercentChange(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                className="input-field font-mono text-sm"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          )}
          {code && !error && validateCouponConfig(code, percent) === null && (
            <p className="text-xs font-medium text-zinc-600">
              Cupom <strong className="text-black">{normalizeCouponCode(code)}</strong> com{" "}
              <strong className="text-black">{percent}%</strong> de desconto será embutido no link.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
