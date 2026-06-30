import type { AdData } from "../types/ad";
import type { AdFormState } from "../hooks/useAdForm";
import { computeExpiresAt } from "./adExpiry";
import { normalizeAdIconChoice } from "./adIcons";
import { buildAdUrl } from "./adRoutes";
import { sanitizePhone } from "./formatters";
import {
  hasAdFormErrors,
  validateAdForm,
  type AdFormValues,
} from "./formValidation";
import { AdSerializer, type FitAdResult } from "./adSerializer";
import { AdCodecError } from "./adCodec";

export class AdBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdBuildError";
  }
}

export interface AdBuildResult extends FitAdResult {
  url: string;
}

function formToValues(state: AdFormState): AdFormValues {
  return {
    adType: state.adType,
    title: state.title,
    price: state.price,
    description: state.description,
    phone: state.phone,
    pix: state.pix,
    cardLink: state.cardLink,
    password: state.password,
  };
}

/**
 * Orquestra: Formulário → Validator → Normalizer → Serializer → Codec → URL
 */
export const AdBuilder = {
  fromFormState(state: AdFormState): AdData {
    const now = Date.now();
    return AdSerializer.normalize({
      t: state.adType,
      title: state.title.trim(),
      price: state.price.trim(),
      billingType: state.billingType,
      desc: state.description.trim(),
      phone: state.phone.trim() ? sanitizePhone(state.phone) : "",
      pix: state.pix.trim() || undefined,
      cardLink: state.cardLink.trim() || undefined,
      icon: normalizeAdIconChoice(state.icon, state.adType),
      timestamp: now,
      expiresAt: computeExpiresAt(now, state.adType),
    });
  },

  async build(state: AdFormState): Promise<AdBuildResult> {
    const errors = validateAdForm(formToValues(state));
    if (hasAdFormErrors(errors)) {
      throw new AdBuildError("Corrija os campos destacados antes de gerar o anúncio.");
    }

    const ad = this.fromFormState(state);
    const result = await AdSerializer.fitForShareUrl(ad, state.password.trim() || undefined);
    return {
      ...result,
      url: buildAdUrl(result.hash),
    };
  },
};

export { AdCodecError } from "./adCodec";