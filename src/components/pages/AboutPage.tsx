import { InstitutionalPageLayout, InstitutionalSection } from "../InstitutionalPageLayout";
import { SITE_NAME } from "../../lib/constants";

interface AboutPageProps {
  adsenseReady: boolean;
}

export function AboutPage({ adsenseReady }: AboutPageProps) {
  return (
    <InstitutionalPageLayout
      title="Sobre o Anuncio Link"
      subtitle="Democratizando o comércio digital direto, rápido e acessível para quem vende pelas redes sociais e WhatsApp."
      adsenseReady={adsenseReady}
    >
      <InstitutionalSection title="Nossa missão">
        <p>
          O <strong>{SITE_NAME}</strong> nasceu para democratizar o comércio digital direto e rápido. Somos uma
          plataforma focada em <strong>simplicidade</strong>, <strong>agilidade</strong> e{" "}
          <strong>eficiência</strong> para quem vende produtos, serviços ou arrecada vaquinhas pelo Instagram,
          Facebook, WhatsApp e outras redes.
        </p>
        <p>
          Acreditamos que criar um anúncio profissional não deveria exigir cadastro, plano pago ou conhecimento
          técnico. Em poucos toques, qualquer pessoa gera um link completo com foto, preço e formas de pagamento —
          pronto para compartilhar.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Tecnologia empregada">
        <p>
          O {SITE_NAME} utiliza tecnologia Web avançada de processamento no lado do cliente (<em>Client-Side</em>).
          Toda a inteligência de compressão de imagens em tempo real (HTML Canvas) e criptografia de dados ocorre no
          próprio navegador do usuário.
        </p>
        <p>
          Isso garante <strong>privacidade absoluta</strong> e <strong>velocidade instantânea</strong>: suas fotos,
          preços e descrições não são salvas em servidores externos nem em banco de dados nosso. O anúncio viaja
          codificado dentro da URL que você compartilha — custo zero de infraestrutura para você e para nós.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Por que custo zero?">
        <p>
          Sem armazenamento em nuvem, sem APIs pagas de hospedagem de mídia e sem cadastro de usuários, conseguimos
          manter a ferramenta gratuita. Você paga apenas o que já usa no dia a dia: seu celular, internet e as taxas
          do seu meio de pagamento (Pix ou cartão).
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
