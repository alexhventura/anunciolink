import { useMemo } from "react";
import type { AdFormState } from "../hooks/useAdForm";
import { AdBuilder } from "../lib/adBuilder";
import { AdSerializer, type PayloadScoreLevel } from "../lib/adSerializer";

const LEVEL_LABEL: Record<PayloadScoreLevel, string> = {
  excellent: "Excelente",
  good: "Bom",
  fair: "Moderado",
  heavy: "Pesado",
};

const LEVEL_DOT: Record<PayloadScoreLevel, string> = {
  excellent: "payload-score__dot--excellent",
  good: "payload-score__dot--good",
  fair: "payload-score__dot--fair",
  heavy: "payload-score__dot--heavy",
};

interface PayloadScoreIndicatorProps {
  form: AdFormState;
}

/** Indicador discreto de peso do payload — local, sem analytics */
export function PayloadScoreIndicator({ form }: PayloadScoreIndicatorProps) {
  const score = useMemo(() => {
    if (!form.title.trim() || !form.price.trim() || !form.description.trim()) {
      return null;
    }
    try {
      return AdSerializer.getPayloadScore(AdBuilder.fromFormState(form));
    } catch {
      return null;
    }
  }, [form]);

  if (!score) return null;

  return (
    <div
      className="payload-score"
      role="status"
      aria-live="polite"
      aria-label={`Peso do link: ${LEVEL_LABEL[score.level]}, ${score.percent} por cento`}
    >
      <span className="payload-score__label">Payload</span>
      <span className={`payload-score__dot ${LEVEL_DOT[score.level]}`} aria-hidden="true" />
      <span className="payload-score__value">{LEVEL_LABEL[score.level]}</span>
      <span className="payload-score__meta">{score.percent}% · {score.bytes} bytes</span>
      <p className="payload-score__tip">{score.tip}</p>
    </div>
  );
}
