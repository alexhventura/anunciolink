import { Lock, QrCode, ShieldCheck, Zap } from "lucide-react";

/** Blocos semânticos para SEO — palavras-chave sem poluir o formulário */
export function HomeSeoSection() {
  return (
    <div className="home-seo max-w-6xl mx-auto w-full px-2 sm:px-3 space-y-5 sm:space-y-6">
      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-create">
        <div className="home-seo__icon" aria-hidden="true">
          <Zap className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-create" className="home-seo__title">
          Crie um anúncio grátis em segundos
        </h2>
        <p className="home-seo__text">
          Gere links de anúncios e páginas de venda gratuitas na hora — com ícone, preço, Pix e
          descrição. Sem cadastro, sem login e sem taxas. Ideal para WhatsApp, Instagram e
          vitrines físicas.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-qr">
        <div className="home-seo__icon" aria-hidden="true">
          <QrCode className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-qr" className="home-seo__title">
          QR Code grátis para vitrines e impressão
        </h2>
        <p className="home-seo__text">
          Cada anúncio gera QR Code automaticamente. Baixe em PNG, imprima cartaz A4 ou cole em
          panfletos e cartões de visita — gerador de QR Code integrado, sem aplicativo extra.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-password">
        <div className="home-seo__icon" aria-hidden="true">
          <Lock className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-password" className="home-seo__title">
          Anúncio protegido por senha (opcional)
        </h2>
        <p className="home-seo__text">
          Quer restringir quem vê título, preço e Pix? Crie uma senha de até 4 caracteres no formulário.
          O anúncio fica criptografado na URL — só quem souber a senha desbloqueia, 100% no navegador.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-privacy">
        <div className="home-seo__icon" aria-hidden="true">
          <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-privacy" className="home-seo__title">
          100% seguro: sem dados salvos
        </h2>
        <p className="home-seo__text">
          Não pedimos cadastro nem administramos pagamentos. Título, Pix e descrição ficam codificados
          na URL que você compartilha — privacidade total, política zero servidor de dados.
        </p>
      </section>
    </div>
  );
}

interface HomeSeoCtaProps {
  onScrollToForm: () => void;
}

export function HomeSeoCta({ onScrollToForm }: HomeSeoCtaProps) {
  return (
    <section className="home-seo-cta neo-card-muted max-w-2xl mx-auto text-center px-2" aria-labelledby="home-seo-cta-title">
      <h2 id="home-seo-cta-title" className="home-seo-cta__title">
        Quer anunciar assim também?
      </h2>
      <p className="home-seo-cta__text">Comece grátis agora — leva menos de um minuto.</p>
      <button type="button" onClick={onScrollToForm} className="btn-primary home-seo-cta__btn">
        Criar minha página
      </button>
    </section>
  );
}
