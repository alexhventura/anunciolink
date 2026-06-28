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
import {
  AdCodecError,
  buildAdUrl,
  encodeAdData,
  fitAdToUrlLength,
} from "./lib/adCodec";
import { saveAdToHistory } from "./lib/adHistory";

export default function App() {
  const { currentView, setCurrentView, decodedAd, openSavedAdUrl, resetToHome, backToEdit } =
    useAdRouting();
  const { state: form, setField, setPhoto, setImageError, setSubmitError, reset: resetForm, toAdData } =
    useAdForm();
  const { refresh: refreshHistory } = useAdHistory();
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageStrippedWarning, setImageStrippedWarning] = useState(false);

  const isAdView = currentView === "anuncio";
  const showAdsense = isAdView || currentView === "success";
  const { adsenseReady } = useAdSenseLoader(showAdsense);

  useDocumentMeta(decodedAd, isAdView);

  const handleResetHome = useCallback(() => {
    resetForm();
    setGeneratedLink("");
    setImageStrippedWarning(false);
    resetToHome();
  }, [resetForm, resetToHome]);

  const handleGenerate = useCallback(
    (compressedImage?: string) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setImageStrippedWarning(false);

      try {
        const rawAd = toAdData(compressedImage);
        const { ad: adObject, hash: hashResult, imageStripped } = fitAdToUrlLength(
          rawAd,
          encodeAdData
        );

        const finalLink = buildAdUrl(hashResult);

        saveAdToHistory({
          title: adObject.title,
          price: adObject.price,
          url: finalLink,
          type: adObject.t,
        });
        refreshHistory();

        setGeneratedLink(finalLink);
        setImageStrippedWarning(imageStripped);
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
    <div className="min-h-screen bg-amber-50/40 font-sans antialiased">
      <Header showNewAdButton={currentView !== "home"} onResetHome={handleResetHome} />

      <main className="mx-auto max-w-xl px-5 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <HomeView
              form={form}
              isSubmitting={isSubmitting}
              onFieldChange={setField}
              onPhotoChange={setPhoto}
              onImageError={setImageError}
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
