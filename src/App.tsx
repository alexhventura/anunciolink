/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./components/HomeView";
import { SuccessView } from "./components/SuccessView";
import { AdViewPage } from "./components/AdViewPage";
import { useAdRouting } from "./hooks/useAdRouting";
import { useAdForm } from "./hooks/useAdForm";
import { useDocumentMeta } from "./hooks/useDocumentMeta";
import { useAdSenseLoader } from "./hooks/useAdSenseLoader";
import { useAdHistory } from "./hooks/useAdHistory";
import type { AdImagePayload } from "./types/ad";
import {
  AdCodecError,
  buildAdUrl,
  encodeAdData,
  fitAdToUrlLength,
} from "./lib/adCodec";
import { saveAdToHistory } from "./lib/adHistory";
import { markAdOwner } from "./lib/adOwnership";

export default function App() {
  const { currentView, setCurrentView, decodedAd, openSavedAdUrl, resetToHome, backToEdit } =
    useAdRouting();
  const {
    state: form,
    setField,
    setPhoto,
    setAudio,
    setImageError,
    setAudioError,
    setSubmitError,
    reset: resetForm,
    toAdData,
  } = useAdForm();
  const { refresh: refreshHistory } = useAdHistory();
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageStrippedWarning, setImageStrippedWarning] = useState(false);
  const [textOptimizedWarning, setTextOptimizedWarning] = useState(false);
  const [audioStrippedWarning, setAudioStrippedWarning] = useState(false);

  const isAdView = currentView === "anuncio";
  const showAdsense = isAdView || currentView === "success";
  const { adsenseReady } = useAdSenseLoader(showAdsense);
  const themeClass = "theme-create";

  useDocumentMeta(decodedAd, isAdView);

  const handleResetHome = useCallback(() => {
    resetForm();
    setGeneratedLink("");
    setImageStrippedWarning(false);
    setTextOptimizedWarning(false);
    setAudioStrippedWarning(false);
    resetToHome();
  }, [resetForm, resetToHome]);

  const handleGenerate = useCallback(
    async (payload?: AdImagePayload) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setImageStrippedWarning(false);
      setTextOptimizedWarning(false);
      setAudioStrippedWarning(false);

      try {
        const rawAd = toAdData(payload?.image);
        const {
          ad: adObject,
          hash: hashResult,
          imageStripped,
          textOptimized,
          audioStripped,
        } = await fitAdToUrlLength(rawAd, encodeAdData);

        const finalLink = buildAdUrl(hashResult);

        markAdOwner(adObject);

        saveAdToHistory({
          title: adObject.title,
          price: adObject.price,
          url: finalLink,
          type: adObject.t,
        });
        refreshHistory();

        setGeneratedLink(finalLink);
        setImageStrippedWarning(imageStripped);
        setTextOptimizedWarning(textOptimized);
        setAudioStrippedWarning(audioStripped);
        setCurrentView("success");
      } catch (err) {
        const message =
          err instanceof AdCodecError
            ? err.message
            : "Não foi possível gerar o anúncio. Tente reduzir o texto ou remover a foto.";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [toAdData, setSubmitError, setCurrentView, refreshHistory]
  );

  return (
    <div className={`min-h-screen font-sans antialiased ${themeClass}`}>
      <Header showNewAdButton={currentView !== "home"} onResetHome={handleResetHome} />

      <main className="mx-auto max-w-xl px-5 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <HomeView
              form={form}
              isSubmitting={isSubmitting}
              onFieldChange={setField}
              onPhotoChange={setPhoto}
              onAudioChange={setAudio}
              onImageError={setImageError}
              onAudioError={(err) => setAudioError(err?.message ?? null)}
              onSubmitError={setSubmitError}
              onSubmit={handleGenerate}
              onOpenSavedAd={openSavedAdUrl}
            />
          )}

          {currentView === "success" && (
            <SuccessView
              form={form}
              generatedLink={generatedLink}
              adsenseReady={adsenseReady}
              imageStrippedWarning={imageStrippedWarning}
              textOptimizedWarning={textOptimizedWarning}
              audioStrippedWarning={audioStrippedWarning}
              onBackToEdit={backToEdit}
              onResetHome={handleResetHome}
            />
          )}

          {currentView === "anuncio" && decodedAd && (
            <AdViewPage ad={decodedAd} adsenseReady={adsenseReady} onCreateOwn={handleResetHome} />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
