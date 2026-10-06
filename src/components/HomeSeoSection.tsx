import { Lock, PawPrint, QrCode, ShieldCheck, Zap } from "lucide-react";

/** Blocos semânticos para SEO — multi-uso, sem forçar pagamento */
export function HomeSeoSection() {
  return (
    <div className="home-seo max-w-6xl mx-auto w-full px-2 sm:px-3 space-y-5 sm:space-y-6">
      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-create">
        <div className="home-seo__icon" aria-hidden="true">
          <Zap className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-create" className="home-seo__title">
          Página grátis com link compartilhável
        </h2>
        <p className="home-seo__text">
          Monte em segundos uma página com título, descrição, ícone e WhatsApp. Use para vender,
          avisar, identificar um pet ou divulgar um serviço — sem cadastro e sem taxas.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-qr">
        <div className="home-seo__icon" aria-hidden="true">
          <QrCode className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-qr" className="home-seo__title">
          QR Code para coleira, vitrine e impressão
        </h2>
        <p className="home-seo__text">
          Cada página gera QR Code automaticamente. Imprima cartaz A4, cole na coleira do pet,
          no cartão de visita ou na vitrine — quem apontar a câmera abre seus dados na hora.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-contact">
        <div className="home-seo__icon" aria-hidden="true">
          <PawPrint className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-contact" className="home-seo__title">
          Contato sem pagamento obrigatório
        </h2>
        <p className="home-seo__text">
          Pix e cartão são opcionais. Para páginas de contato ou aviso, basta WhatsApp e descrição —
          ideal para pets perdidos, eventos, comunicados e cartões digitais.
        </p>
      </section>

      <section className="home-seo__block neo-card-white" aria-labelledby="home-seo-privacy">
        <div className="home-seo__icon" aria-hidden="true">
          <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h2 id="home-seo-privacy" className="home-seo__title">
          100% no navegador · senha opcional
        </h2>
        <p className="home-seo__text">
          Não pedimos cadastro nem guardamos seus dados em servidor. Tudo vai codificado na URL.
          Se quiser, proteja com senha de até 4 caracteres — criptografia no próprio aparelho.
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
        Pronto para criar sua página?
      </h2>
      <p className="home-seo-cta__text">Venda, aviso ou QR de contato — grátis em menos de um minuto.</p>
      <button type="button" onClick={onScrollToForm} className="btn-primary home-seo-cta__btn">
        Criar minha página
      </button>
    </section>
  );
}
