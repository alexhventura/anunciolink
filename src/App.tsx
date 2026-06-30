import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useAdRouting } from "./hooks/useAdRouting";
import { useAdForm } from "./hooks/useAdForm";
import { useDocumentMeta } from "./hooks/useDocumentMeta";
import { useAdSenseLoader } from "./hooks/useAdSenseLoader";
import { useAdHistory } from "./hooks/useAdHistory";
import { saveAdToHistory } from "./lib/adHistory";
import { focusMainContent } from "./lib/focusMainContent";
import { AdBuilder } from "./lib/adBuilder";
import { AdCodecError } from "./lib/adCodec";

const HomeView = lazy(() =>
  import("./components/HomeView").then((m) => ({ default: m.HomeView }))
);
const SuccessView = lazy(() =>
  import("./components/SuccessView").then((m) => ({ default: m.SuccessView }))
);
const AdUnlockPage = lazy(() =>
  import("./components/AdUnlockPage").then((m) => ({ default: m.AdUnlockPage }))
);
const AdViewPage = lazy(() =>
  import("./components/AdViewPage").then((m) => ({ default: m.AdViewPage }))
);
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
      <p className="text-sm font-bold text-zinc-700">Carregando página…</p>
    </div>
  );
}

export default function App() {
  const {
    currentView,
    setCurrentView,
    decodedAd,
    lockedPayload,
    unlockAd,
    openSavedAdUrl,
    resetToHome,
    backToEdit,
    navigateToPage,
    isInstitutionalView,
  } = useAdRouting();
  const { state: form, setField, setSubmitError, reset: resetForm } = useAdForm();
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

  useEffect(() => {
    focusMainContent();
  }, [currentView]);

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
      const { ad: adObject, hash: hashResult, textOptimized, url: finalLink } =
        await AdBuilder.build(form);

      const saved = saveAdToHistory({
        title: adObject.title,
        price: adObject.price,
        url: finalLink,
        type: adObject.t,
      });
      if (saved) refreshHistory();

      setGeneratedLink(finalLink);
      setTextOptimizedWarning(textOptimized);
      setCurrentView("success");
    } catch (err) {
      const message =
        err instanceof AdCodecError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível gerar o anúncio. Tente reduzir o texto.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, setSubmitError, setCurrentView, refreshHistory]);

  const mainMaxWidth =
    currentView === "home"
      ? "max-w-6xl"
      : currentView === "anuncio" || isInstitutionalView
        ? "max-w-2xl"
        : "max-w-xl";

  return (
    <div className={`min-h-screen font-sans antialiased ${themeClass}`}>
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header onResetHome={handleResetHome} onNavigate={navigateToPage} />

      <main
        id="conteudo-principal"
        aria-label="Conteúdo principal do Anuncio Link"
        className={`mx-auto w-full min-w-0 px-4 sm:px-5 py-8 sm:py-12 md:py-16 ${mainMaxWidth}`}
      >
        <div key={currentView}>
          {currentView === "home" && (
            <Suspense fallback={<PageFallback />}>
              <HomeView
                form={form}
                isSubmitting={isSubmitting}
                adsenseReady={adsenseReady}
                onFieldChange={setField}
                onSubmitError={setSubmitError}
                onSubmit={handleGenerate}
                onOpenSavedAd={openSavedAdUrl}
              />
            </Suspense>
          )}

          {currentView === "success" && (
            <Suspense fallback={<PageFallback />}>
              <SuccessView
                form={form}
                generatedLink={generatedLink}
                adsenseReady={adsenseReady}
                textOptimizedWarning={textOptimizedWarning}
                onBackToEdit={backToEdit}
                onResetHome={handleResetHome}
              />
            </Suspense>
          )}

          {currentView === "anuncio" && lockedPayload && !decodedAd && (
            <Suspense fallback={<PageFallback />}>
              <AdUnlockPage onUnlock={unlockAd} />
            </Suspense>
          )}

          {currentView === "anuncio" && decodedAd && (
            <Suspense fallback={<PageFallback />}>
              <AdViewPage ad={decodedAd} adsenseReady={adsenseReady} onCreateOwn={handleResetHome} />
            </Suspense>
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
