import { useCallback, useReducer } from "react";
import type { AdData, AdType, BillingType, ImageUploadError } from "../types/ad";
import { computeExpiresAt } from "../lib/adExpiry";
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
  photoFile: File | null;
  photoPreview: string;
  printMode: boolean;
  imageError: ImageUploadError | null;
  submitError: string | null;
}

type AdFormAction =
  | { type: "SET_FIELD"; field: keyof AdFormState; value: AdFormState[keyof AdFormState] }
  | { type: "SET_PHOTO"; file: File | null; preview: string }
  | { type: "SET_IMAGE_ERROR"; error: ImageUploadError | null }
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
  photoFile: null,
  photoPreview: "",
  printMode: false,
  imageError: null,
  submitError: null,
};

function adFormReducer(state: AdFormState, action: AdFormAction): AdFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PHOTO":
      return {
        ...state,
        photoFile: action.file,
        photoPreview: action.preview,
        imageError: null,
      };
    case "SET_IMAGE_ERROR":
      return { ...state, imageError: action.error, photoFile: null, photoPreview: "" };
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

  const setPhoto = useCallback((file: File | null, preview: string) => {
    dispatch({ type: "SET_PHOTO", file, preview });
  }, []);

  const setImageError = useCallback((error: ImageUploadError | null) => {
    dispatch({ type: "SET_IMAGE_ERROR", error });
  }, []);

  const setSubmitError = useCallback((error: string | null) => {
    dispatch({ type: "SET_SUBMIT_ERROR", error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const toAdData = useCallback(
    (compressedImage?: string): AdData => {
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
        img: compressedImage,
        timestamp: now,
        expiresAt: computeExpiresAt(now),
        printMode: state.printMode || undefined,
      });
    },
    [state]
  );

  return { state, setField, setPhoto, setImageError, setSubmitError, reset, toAdData };
}
