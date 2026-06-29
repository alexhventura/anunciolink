import { Suspense, lazy, useCallback, useState } from "react";
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

const HowItWorksPage = lazy(() =>
  import("./components/pages/HowItWorksPage").then((m) => ({ default: m.HowItWorksPage }))
);
const AboutPage = lazy(() =>
  import("./components/pages/AboutPage").then((m) => ({ default: m.AboutPage }))
);
const PrivacyPage = lazy(() =>
  import("./components/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage }))
);
const TermsPage = lazy(() =>
  import("./components/pages/TermsPage").then((m) => ({ default: m.TermsPage }))
);

function PageFallback() {
  return (
    <div className="neo-card-white p-10 text-center" role="status" aria-live="polite">
      <p className="text-sm font-bold text-zinc-700">Carregando…</p>
    </div>
  );
}

export default function App() {
  const {
    currentView,
    setCurrentView,
    decodedAd,
    openSavedAdUrl,
    resetToHome,
    backToEdit,
    navigateToPage,
    isInstitutionalView,
  } = useAdRouting();
  const { state: form, setField, setSubmitError, reset: resetForm, toAdData } = useAdForm();
  const { refresh: refreshHistory } = useAdHistory();
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textOptimizedWarning, setTextOptimizedWarning] = useState(false);

  const isAdView = currentView === "anuncio";
  const showAdsense =
    currentView === "home" || isAdView || currentView === "success" || isInstitutionalView;
  const { adsenseReady } = useAdSenseLoader(showAdsense, { eager: isAdView });
  const themeClass = "theme-create";

  useDocumentMeta(decodedAd, currentView);

  const handleResetHome = useCallback(() => {
    resetForm();
    setGeneratedLink("");
    setTextOptimizedWarning(false);
    resetToHome();
  }, [resetForm, resetToHome]);

  const handleGenerate = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setTextOptimizedWarning(false);

    try {
      const rawAd = toAdData();
      const { ad: adObject, hash: hashResult, textOptimized } =
        await fitAdToUrlLength(rawAd, encodeAdData);

      const finalLink = buildAdUrl(hashResult);

      saveAdToHistory({
        title: adObject.title,
        price: adObject.price,
        url: finalLink,
        type: adObject.t,
      });
      refreshHistory();

      setGeneratedLink(finalLink);
      setTextOptimizedWarning(textOptimized);
      setCurrentView("success");
    } catch (err) {
      const message =
        err instanceof AdCodecError
          ? err.message
          : "Não foi possível gerar o anúncio. Tente reduzir o texto.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [toAdData, setSubmitError, setCurrentView, refreshHistory]);

  return (
    <div className={`min-h-screen font-sans antialiased ${themeClass}`}>
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header onResetHome={handleResetHome} onNavigate={navigateToPage} />

      <main
        id="conteudo-principal"
        aria-label="Conteúdo principal do Anuncio Link"
        className={`mx-auto px-5 py-12 md:py-16 ${isInstitutionalView ? "max-w-2xl" : "max-w-xl"}`}
      >
        <div key={currentView}>
          {currentView === "home" && (
            <HomeView
              form={form}
              isSubmitting={isSubmitting}
              adsenseReady={adsenseReady}
              onFieldChange={setField}
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
              textOptimizedWarning={textOptimizedWarning}
              onBackToEdit={backToEdit}
              onResetHome={handleResetHome}
            />
          )}

          {currentView === "anuncio" && decodedAd && (
            <AdViewPage ad={decodedAd} adsenseReady={adsenseReady} onCreateOwn={handleResetHome} />
          )}

          {currentView === "como-funciona" && (
            <Suspense fallback={<PageFallback />}>
              <HowItWorksPage adsenseReady={adsenseReady} />
            </Suspense>
          )}

          {currentView === "sobre" && (
            <Suspense fallback={<PageFallback />}>
              <AboutPage adsenseReady={adsenseReady} />
            </Suspense>
          )}

          {currentView === "privacidade" && (
            <Suspense fallback={<PageFallback />}>
              <PrivacyPage adsenseReady={adsenseReady} />
            </Suspense>
          )}

          {currentView === "termos" && (
            <Suspense fallback={<PageFallback />}>
              <TermsPage adsenseReady={adsenseReady} />
            </Suspense>
          )}
        </div>
      </main>

      <Footer onNavigate={navigateToPage} />
    </div>
  );
}
