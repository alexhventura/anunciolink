import { useCallback, useEffect, useState } from "react";
import type { AdData, AppView } from "../types/ad";
import { decodeAdData } from "../lib/adCodec";
import {
  extractPayloadFromLocation,
  isAdPathname,
  navigateToAdPath,
  navigateToHome,
  upgradeHashRouteToPath,
} from "../lib/adRoutes";
import { applyAdDocumentMeta, applyHomeDocumentMeta } from "../lib/documentMeta";

function resolveRoute(): { view: AppView; ad: AdData | null; payload: string } {
  if (typeof window === "undefined") {
    return { view: "home", ad: null, payload: "" };
  }

  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();
  if (!payload) return { view: "home", ad: null, payload: "" };

  const ad = decodeAdData(payload);
  if (ad) return { view: "anuncio", ad, payload };
  return { view: "home", ad: null, payload: "" };
}

const initialRoute = resolveRoute();

function applyRouteFromLocation(): { view: AppView; ad: AdData | null; payload: string } {
  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();

  if (payload) {
    const data = decodeAdData(payload);
    if (data) {
      applyAdDocumentMeta(data);
      return { view: "anuncio", ad: data, payload };
    }
  }

  if (!isAdPathname(window.location.pathname)) {
    applyHomeDocumentMeta();
  }

  return { view: "home", ad: null, payload: "" };
}

export function useAdRouting() {
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [adPayload, setAdPayload] = useState(initialRoute.payload);
  const [decodedAd, setDecodedAd] = useState<AdData | null>(initialRoute.ad);

  const syncFromLocation = useCallback(() => {
    const route = applyRouteFromLocation();
    setAdPayload(route.payload);
    setDecodedAd(route.ad);
    setCurrentView(route.view);
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [syncFromLocation]);

  const openSavedAdUrl = useCallback(
    (url: string) => {
      try {
        const parsed = new URL(url, window.location.origin);
        if (isAdPathname(parsed.pathname)) {
          history.pushState(null, "", `${parsed.pathname}${parsed.search}`);
          syncFromLocation();
          return;
        }
        if (parsed.hash.startsWith("#dados=")) {
          const payload = parsed.hash.substring(7);
          navigateToAdPath(payload, true);
          syncFromLocation();
          return;
        }
        window.location.assign(url);
      } catch {
        window.location.assign(url);
      }
    },
    [syncFromLocation]
  );

  const resetToHome = useCallback(() => {
    navigateToHome(true);
    applyHomeDocumentMeta();
    setAdPayload("");
    setDecodedAd(null);
    setCurrentView("home");
  }, []);

  const backToEdit = useCallback(() => {
    navigateToHome(true);
    applyHomeDocumentMeta();
    setCurrentView("home");
  }, []);

  const goToAd = useCallback((payload: string) => {
    navigateToAdPath(payload, true);
    const ad = decodeAdData(payload);
    if (ad) {
      applyAdDocumentMeta(ad);
      setAdPayload(payload);
      setDecodedAd(ad);
      setCurrentView("anuncio");
    }
  }, []);

  return {
    currentView,
    setCurrentView,
    adPayload,
    decodedAd,
    openSavedAdUrl,
    resetToHome,
    backToEdit,
    goToAd,
  };
}
