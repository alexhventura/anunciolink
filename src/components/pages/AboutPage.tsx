import { InstitutionalPageLayout, InstitutionalSection } from "../InstitutionalPageLayout";
import { SITE_DOMAIN, SITE_NAME } from "../../lib/constants";

interface AboutPageProps {
  adsenseReady: boolean;
}

export function AboutPage({ adsenseReady }: AboutPageProps) {
  return (
    <InstitutionalPageLayout
      title="Sobre o Anuncio Link"
      subtitle="Páginas de anúncio profissionais, instantâneas e gratuitas — para quem vende pelo WhatsApp e pelas redes."
      adsenseReady={adsenseReady}
    >
      <InstitutionalSection title="Nossa missão">
        <p>
          O <strong>{SITE_NAME}</strong> democratiza o comércio digital direto. Somos uma ferramenta focada em{" "}
          <strong>simplicidade</strong>, <strong>agilidade</strong> e <strong>eficiência</strong> para quem
          vende produtos, oferece serviços ou organiza vaquinhas pelo Instagram, Facebook, WhatsApp e outras
          redes.
        </p>
        <p>
          Criar um anúncio profissional não deveria exigir cadastro, plano pago ou conhecimento técnico. Em
          poucos toques você gera uma página completa com ícone, preço, Pix, QR Code e formas de pagamento —
          pronta para compartilhar.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Como a tecnologia funciona">
        <p>
          Toda a inteligência roda no seu navegador (<em>client-side</em>): montagem do anúncio, geração do QR
          Code, card PNG para redes sociais e cartaz para impressão. Os dados são compactados e codificados
          dentro da <strong>URL que você compartilha</strong>.
        </p>
        <p>
          Isso garante <strong>privacidade</strong> e <strong>velocidade</strong>: título, preço, descrição e
          Pix não ficam em banco de dados nosso. Quem acessa o link vê o anúncio decodificado na hora — sem
          depender de servidor para armazenar seu conteúdo.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Identidade visual">
        <p>
          Cada anúncio usa o visual Bento do {SITE_NAME}: mostarda, preto e branco, com ícone em destaque sobre
          fundo claro e card legível em qualquer celular. O mesmo layout aparece na página pública, no card
          para postagem e no cartaz A4.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Por que custo zero?">
        <p>
          Sem armazenamento em nuvem, sem APIs pagas de hospedagem e sem cadastro de usuários, mantemos a
          ferramenta gratuita. Você usa apenas celular, internet e o que já tem de meio de pagamento (Pix ou
          cartão).
        </p>
        <p>
          Conheça o passo a passo completo em <strong>Como Funciona</strong> ou comece agora em{" "}
          <strong>{SITE_DOMAIN}</strong>.
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
