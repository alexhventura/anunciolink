import { useCallback, useEffect, useState } from "react";
import type { AdData, AppView } from "../types/ad";
import {
  extractPayloadFromLocation,
  isAdPathname,
  navigateToAdPath,
  navigateToHome,
  upgradeHashRouteToPath,
} from "../lib/adRoutes";
import { DocumentHeadService } from "../lib/documentHeadService";
import { getBootstrapAdResult } from "../lib/bootstrappedAd";
import { isLockedPayload, tryUnlockAdData } from "../lib/adLock";
import {
  getInstitutionalViewFromPathname,
  isInstitutionalView,
  navigateToInstitutionalPage,
} from "../lib/siteRoutes";

function resolveInitialRoute(): {
  view: AppView;
  ad: AdData | null;
  lockedPayload: string | null;
} {
  if (typeof window === "undefined") {
    return { view: "home", ad: null, lockedPayload: null };
  }

  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();

  if (payload && isLockedPayload(payload)) {
    return { view: "anuncio", ad: null, lockedPayload: payload };
  }

  const bootstrap = getBootstrapAdResult();
  if (bootstrap.payload && bootstrap.ad) {
    return { view: "anuncio", ad: bootstrap.ad, lockedPayload: null };
  }

  const institutionalView = getInstitutionalViewFromPathname(window.location.pathname);
  if (institutionalView) {
    return { view: institutionalView, ad: null, lockedPayload: null };
  }

  return { view: "home", ad: null, lockedPayload: null };
}

const initialRoute = resolveInitialRoute();

async function decodePayload(payload: string): Promise<AdData | null> {
  const { decodeAdData } = await import("../lib/adCodec");
  return decodeAdData(payload);
}

function applyRouteFromLocation(): { view: AppView; ad: AdData | null } {
  upgradeHashRouteToPath();
  const payload = extractPayloadFromLocation();

  if (payload) {
    const bootstrap = getBootstrapAdResult();
    if (bootstrap.payload === payload && bootstrap.ad) {
      DocumentHeadService.apply("anuncio", bootstrap.ad);
      return { view: "anuncio", ad: bootstrap.ad };
    }
  }

  const institutionalView = getInstitutionalViewFromPathname(window.location.pathname);
  if (institutionalView) {
    DocumentHeadService.apply(institutionalView, null);
    return { view: institutionalView, ad: null };
  }

  if (!isAdPathname(window.location.pathname)) {
    DocumentHeadService.apply("home", null);
  }

  return { view: "home", ad: null };
}

export function useAdRouting() {
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [decodedAd, setDecodedAd] = useState<AdData | null>(initialRoute.ad);
  const [lockedPayload, setLockedPayload] = useState<string | null>(initialRoute.lockedPayload);

  const syncFromLocation = useCallback(async () => {
    const payload = extractPayloadFromLocation();
    if (payload) {
      if (isLockedPayload(payload)) {
        DocumentHeadService.applyLocked();
        setLockedPayload(payload);
        setDecodedAd(null);
        setCurrentView("anuncio");
        return;
      }

      setLockedPayload(null);

      const bootstrap = getBootstrapAdResult();
      if (bootstrap.payload === payload && bootstrap.ad) {
        DocumentHeadService.apply("anuncio", bootstrap.ad);
        setDecodedAd(bootstrap.ad);
        setCurrentView("anuncio");
        return;
      }

      const data = await decodePayload(payload);
      if (data) {
        DocumentHeadService.apply("anuncio", data);
        setDecodedAd(data);
        setCurrentView("anuncio");
        return;
      }
    } else {
      setLockedPayload(null);
    }

    const route = applyRouteFromLocation();
    setDecodedAd(route.ad);
    setCurrentView(route.view);
  }, []);

  const unlockAd = useCallback(
    (password: string): boolean => {
      if (!lockedPayload) return false;
      const ad = tryUnlockAdData(lockedPayload, password);
      if (!ad) return false;
      DocumentHeadService.apply("anuncio", ad);
      setDecodedAd(ad);
      setLockedPayload(null);
      return true;
    },
    [lockedPayload]
  );

  useEffect(() => {
    if (initialRoute.lockedPayload) {
      DocumentHeadService.applyLocked();
      return;
    }
    if (initialRoute.view !== "home" || initialRoute.ad) {
      DocumentHeadService.apply(initialRoute.view, initialRoute.ad);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => void syncFromLocation();
    const onHashChange = () => void syncFromLocation();
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [syncFromLocation]);

  const openSavedAdUrl = useCallback(
    (url: string) => {
      try {
        const parsed = new URL(url, window.location.origin);
        if (isAdPathname(parsed.pathname)) {
          history.pushState(null, "", `${parsed.pathname}${parsed.search}`);
          void syncFromLocation();
          return;
        }
        if (parsed.hash.startsWith("#dados=")) {
          const payload = parsed.hash.substring(7);
          navigateToAdPath(payload, true);
          void syncFromLocation();
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
    DocumentHeadService.apply("home", null);
    setDecodedAd(null);
    setLockedPayload(null);
    setCurrentView("home");
  }, []);

  const backToEdit = useCallback(() => {
    navigateToHome(true);
    DocumentHeadService.apply("home", null);
    setCurrentView("home");
  }, []);

  const navigateToPage = useCallback(
    (view: AppView) => {
      if (view === "anuncio" || view === "success") return;

      if (view === "home") {
        resetToHome();
        return;
      }

      navigateToInstitutionalPage(view);
      DocumentHeadService.apply(view, null);
      setDecodedAd(null);
      setLockedPayload(null);
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [resetToHome]
  );

  return {
    currentView,
    setCurrentView,
    decodedAd,
    lockedPayload,
    unlockAd,
    openSavedAdUrl,
    resetToHome,
    backToEdit,
    navigateToPage,
    isInstitutionalView: isInstitutionalView(currentView),
  };
}
