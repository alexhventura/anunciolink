import { useCallback, useReducer } from "react";
import type { AdData, AdType, BillingType } from "../types/ad";
import { computeExpiresAt } from "../lib/adExpiry";
import { ALL_AD_ICONS, DEFAULT_AD_ICON, resolveAdIcon } from "../lib/adIcons";
import { normalizeExternalImageUrl } from "../lib/externalImageUrl";
import { sanitizePhone } from "../lib/formatters";
import { sanitizeAdData } from "../lib/sanitizeAd";

export interface AdFormState {
  adType: AdType;
  billingType: BillingType;
  title: string;
  price: string;
  description: string;
  phone: string;
  pix: string;
  cardLink: string;
  imageUrl: string;
  icon: string;
  submitError: string | null;
}

type AdFormAction =
  | { type: "SET_FIELD"; field: keyof AdFormState; value: AdFormState[keyof AdFormState] }
  | { type: "SET_SUBMIT_ERROR"; error: string | null }
  | { type: "RESET" };

const initialState: AdFormState = {
  adType: "venda",
  billingType: "unico",
  title: "",
  price: "",
  description: "",
  phone: "",
  pix: "",
  cardLink: "",
  imageUrl: "",
  icon: DEFAULT_AD_ICON.venda,
  submitError: null,
};

function adFormReducer(state: AdFormState, action: AdFormAction): AdFormState {
  switch (action.type) {
    case "SET_FIELD": {
      const next = { ...state, [action.field]: action.value };
      if (action.field === "adType" && typeof action.value === "string") {
        const adType = action.value as AdType;
        if (!ALL_AD_ICONS.includes(next.icon) || next.icon === DEFAULT_AD_ICON[state.adType]) {
          next.icon = DEFAULT_AD_ICON[adType];
        }
      }
      return next;
    }
    case "SET_SUBMIT_ERROR":
      return { ...state, submitError: action.error };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export function useAdForm() {
  const [state, dispatch] = useReducer(adFormReducer, initialState);

  const setField = useCallback(<K extends keyof AdFormState>(field: K, value: AdFormState[K]) => {
    dispatch({ type: "SET_FIELD", field, value });
  }, []);

  const setSubmitError = useCallback((error: string | null) => {
    dispatch({ type: "SET_SUBMIT_ERROR", error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const toAdData = useCallback((): AdData => {
    const now = Date.now();
    return sanitizeAdData({
      t: state.adType,
      title: state.title.trim(),
      price: state.price.trim(),
      billingType: state.billingType,
      desc: state.description.trim(),
      phone: state.phone.trim() ? sanitizePhone(state.phone) : "",
      pix: state.pix.trim() || undefined,
      cardLink: state.cardLink.trim() || undefined,
      icon: resolveAdIcon(state.icon, state.adType),
      img: normalizeExternalImageUrl(state.imageUrl),
      timestamp: now,
      expiresAt: computeExpiresAt(now),
    });
  }, [state]);

  return { state, setField, setSubmitError, reset, toAdData };
}
