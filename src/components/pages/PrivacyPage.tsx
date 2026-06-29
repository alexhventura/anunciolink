import { InstitutionalPageLayout, InstitutionalSection } from "../InstitutionalPageLayout";
import { SITE_NAME } from "../../lib/constants";

interface PrivacyPageProps {
  adsenseReady: boolean;
}

export function PrivacyPage({ adsenseReady }: PrivacyPageProps) {
  return (
    <InstitutionalPageLayout
      title="Privacidade e Cookies"
      subtitle="Transparência total sobre como o Anuncio Link trata seus dados — ou melhor, como não os armazena."
      adsenseReady={adsenseReady}
    >
      <InstitutionalSection title="Zero coleta em servidores próprios">
        <p>
          O <strong>{SITE_NAME}</strong> <strong>não armazena</strong>, <strong>não coleta</strong> e{" "}
          <strong>não rastreia</strong> nenhuma informação pessoal, foto, preço ou dados bancários em servidores
          próprios ou banco de dados.
        </p>
        <p>
          Tudo o que você preenche no formulário é processado localmente no seu navegador e codificado
          exclusivamente dentro da <strong>URL gerada</strong>. Quem tem acesso aos dados do anúncio são apenas as
          pessoas com quem você compartilha o link.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Processamento no seu dispositivo">
        <p>
          A compressão de imagens, a montagem do anúncio e a criptografia acontecem no seu celular ou computador. Não
          enviamos fotos nem textos para análise em servidores externos como parte do fluxo de criação do anúncio.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Cookies e anúncios">
        <p>
          Utilizamos cookies básicos necessários para o funcionamento da plataforma e para a veiculação de anúncios do{" "}
          <strong>Google AdSense</strong>. Esses cookies podem ser usados pelo Google para personalizar anúncios
          conforme suas políticas.
        </p>
        <p>
          Você pode gerenciar preferências de cookies nas configurações do seu navegador. O uso do {SITE_NAME} para
          criar anúncios não exige login nem cadastro.
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
