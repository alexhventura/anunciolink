import { useState } from "react";
import type { AdData } from "../types/ad";
import {
  applyDiscountToPrice,
  formatDiscountLabel,
  hasActiveCoupon,
  matchesCoupon,
  normalizeCouponCode,
} from "../lib/coupon";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import { FieldLabelWithHint } from "./HelpTooltip";

interface CouponRedeemProps {
  ad: AdData;
  disabled?: boolean;
  onApplied: (discountedPrice: string | null) => void;
}

export function CouponRedeem({ ad, disabled = false, onApplied }: CouponRedeemProps) {
  const [input, setInput] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasActiveCoupon(ad) || disabled) return null;

  const handleApply = () => {
    if (!input.trim()) {
      setError("Digite o código do cupom.");
      onApplied(null);
      return;
    }
    if (matchesCoupon(input, ad)) {
      const discounted = applyDiscountToPrice(ad.price, ad.couponPercent!);
      setApplied(true);
      setError(null);
      onApplied(discounted);
      return;
    }
    setApplied(false);
    setError("Cupom inválido. Verifique o código e tente novamente.");
    onApplied(null);
  };

  const handleClear = () => {
    setInput("");
    setApplied(false);
    setError(null);
    onApplied(null);
  };

  return (
    <div className="rounded-lg border-2 border-zinc-900 bg-amber-50 p-4 shadow-[2px_2px_0_0_#18181b] space-y-3">
      <FieldLabelWithHint htmlFor="coupon-redeem-input" hint={TOOLTIP_COPY.couponRedeem}>
        Possui um cupom?
      </FieldLabelWithHint>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="coupon-redeem-input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(normalizeCouponCode(e.target.value));
            if (applied) {
              setApplied(false);
              onApplied(null);
            }
            setError(null);
          }}
          placeholder="Digite o código"
          className="input-field font-mono text-sm uppercase flex-1 !shadow-none"
          autoComplete="off"
        />
        {applied ? (
          <button type="button" onClick={handleClear} id="btn-coupon-clear" className="btn-ghost !min-h-[48px] !text-xs shrink-0">
            Remover
          </button>
        ) : (
          <button type="button" onClick={handleApply} id="btn-coupon-apply" className="btn-accent !min-h-[48px] !text-xs shrink-0">
            Aplicar
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {applied && (
        <p role="status" className="text-xs font-bold text-black">
          ✓ Cupom aplicado — {formatDiscountLabel(ad.couponPercent!)} no valor!
        </p>
      )}
    </div>
  );
}
