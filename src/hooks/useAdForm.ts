import { useCallback, useReducer } from "react";
import type { AdData, AdType, BillingType, ImageUploadError } from "../types/ad";
import { normalizeCouponCode, validateCouponConfig } from "../lib/coupon";
import { computeExpiresAt } from "../lib/adExpiry";
import { sanitizePhone } from "../lib/formatters";

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
  audioDataUrl: string;
  couponEnabled: boolean;
  couponCode: string;
  couponPercent: number;
  printMode: boolean;
  imageError: ImageUploadError | null;
  audioError: string | null;
  couponError: string | null;
  submitError: string | null;
}

type AdFormAction =
  | { type: "SET_FIELD"; field: keyof AdFormState; value: AdFormState[keyof AdFormState] }
  | { type: "SET_PHOTO"; file: File | null; preview: string }
  | { type: "SET_AUDIO"; dataUrl: string }
  | { type: "SET_IMAGE_ERROR"; error: ImageUploadError | null }
  | { type: "SET_AUDIO_ERROR"; error: string | null }
  | { type: "SET_COUPON_ERROR"; error: string | null }
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
  audioDataUrl: "",
  couponEnabled: false,
  couponCode: "",
  couponPercent: 10,
  printMode: false,
  imageError: null,
  audioError: null,
  couponError: null,
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
    case "SET_AUDIO":
      return { ...state, audioDataUrl: action.dataUrl, audioError: null };
    case "SET_IMAGE_ERROR":
      return { ...state, imageError: action.error, photoFile: null, photoPreview: "" };
    case "SET_AUDIO_ERROR":
      return { ...state, audioError: action.error };
    case "SET_COUPON_ERROR":
      return { ...state, couponError: action.error };
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

  const setAudio = useCallback((dataUrl: string) => {
    dispatch({ type: "SET_AUDIO", dataUrl });
  }, []);

  const setImageError = useCallback((error: ImageUploadError | null) => {
    dispatch({ type: "SET_IMAGE_ERROR", error });
  }, []);

  const setAudioError = useCallback((error: string | null) => {
    dispatch({ type: "SET_AUDIO_ERROR", error });
  }, []);

  const setCouponError = useCallback((error: string | null) => {
    dispatch({ type: "SET_COUPON_ERROR", error });
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
      const couponCode = state.couponEnabled ? normalizeCouponCode(state.couponCode) : "";
      const couponValidation = state.couponEnabled
        ? validateCouponConfig(couponCode, state.couponPercent)
        : null;

      return {
        t: state.adType,
        title: state.title.trim(),
        price: state.price.trim(),
        billingType: state.billingType,
        desc: state.description.trim(),
        phone: state.phone.trim() ? sanitizePhone(state.phone) : "",
        pix: state.pix.trim() || undefined,
        cardLink: state.cardLink.trim() || undefined,
        img: compressedImage,
        audio: state.audioDataUrl || undefined,
        couponCode:
          state.couponEnabled && couponCode && !couponValidation ? couponCode : undefined,
        couponPercent:
          state.couponEnabled && couponCode && !couponValidation
            ? state.couponPercent
            : undefined,
        timestamp: now,
        expiresAt: computeExpiresAt(now),
        printMode: state.printMode || undefined,
      };
    },
    [state]
  );

  return {
    state,
    setField,
    setPhoto,
    setAudio,
    setImageError,
    setAudioError,
    setCouponError,
    setSubmitError,
    reset,
    toAdData,
  };
}
