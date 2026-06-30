import { useCallback, useReducer } from "react";
import type { AdData, AdType, BillingType } from "../types/ad";
import { computeExpiresAt } from "../lib/adExpiry";
import type { AdIconId } from "../lib/adIcons";
import { DEFAULT_AD_ICON_ID, isValidAdIconId, resolveAdIconId } from "../lib/adIcons";
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
  icon: AdIconId;
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
  icon: DEFAULT_AD_ICON_ID.venda,
  submitError: null,
};

function adFormReducer(state: AdFormState, action: AdFormAction): AdFormState {
  switch (action.type) {
    case "SET_FIELD": {
      const next = { ...state, [action.field]: action.value };
      if (action.field === "adType" && typeof action.value === "string") {
        const adType = action.value as AdType;
        if (!isValidAdIconId(next.icon) || next.icon === DEFAULT_AD_ICON_ID[state.adType]) {
          next.icon = DEFAULT_AD_ICON_ID[adType];
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
      icon: resolveAdIconId(state.icon, state.adType),
      timestamp: now,
      expiresAt: computeExpiresAt(now),
    });
  }, [state]);

  return { state, setField, setSubmitError, reset, toAdData };
}
