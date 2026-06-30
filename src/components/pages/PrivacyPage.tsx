import { InstitutionalPageLayout, InstitutionalSection } from "../InstitutionalPageLayout";
import { SITE_NAME } from "../../lib/constants";

interface PrivacyPageProps {
  adsenseReady: boolean;
}

export function PrivacyPage({ adsenseReady }: PrivacyPageProps) {
  return (
    <InstitutionalPageLayout
      title="Privacidade e Cookies"
      subtitle="Transparência sobre como o Anuncio Link trata seus dados — ou melhor, como não os armazena em servidor."
      adsenseReady={adsenseReady}
    >
      <InstitutionalSection title="Zero coleta em servidores próprios">
        <p>
          O <strong>{SITE_NAME}</strong> <strong>não armazena</strong>, <strong>não coleta</strong> e{" "}
          <strong>não mantém banco de dados</strong> com título, preço, descrição, Pix, telefone ou links de
          pagamento dos seus anúncios.
        </p>
        <p>
          O que você preenche no formulário é processado localmente no seu navegador e codificado dentro da{" "}
          <strong>URL gerada</strong>. Quem tem acesso aos dados do anúncio são apenas as pessoas com quem você
          compartilha o link.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Processamento no seu dispositivo">
        <p>
          A montagem do anúncio, a geração do QR Code, do card PNG e do cartaz A4 acontecem no seu celular ou
          computador. Não enviamos o conteúdo do anúncio para servidores externos como parte do fluxo de
          criação.
        </p>
        <p>
          O histórico <strong>Meus anúncios</strong> fica salvo apenas no armazenamento local do seu navegador
          (localStorage), na sua máquina — não sincronizamos entre dispositivos.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Cookies e anúncios">
        <p>
          Utilizamos cookies básicos necessários para o funcionamento da plataforma e para a veiculação de
          anúncios do <strong>Google AdSense</strong>. Esses cookies podem ser usados pelo Google para
          personalizar anúncios conforme suas políticas.
        </p>
        <p>
          Você pode gerenciar preferências de cookies nas configurações do seu navegador. Criar anúncios no{" "}
          {SITE_NAME} não exige login nem cadastro.
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
