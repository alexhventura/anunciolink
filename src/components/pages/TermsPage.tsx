import { InstitutionalPageLayout, InstitutionalSection } from "../InstitutionalPageLayout";
import { SITE_NAME } from "../../lib/constants";

interface TermsPageProps {
  adsenseReady: boolean;
}

export function TermsPage({ adsenseReady }: TermsPageProps) {
  return (
    <InstitutionalPageLayout
      title="Termos de Uso"
      subtitle="Regras simples para usar o Anuncio Link com segurança e responsabilidade."
      adsenseReady={adsenseReady}
    >
      <InstitutionalSection title="Ferramenta gratuita de facilitação">
        <p>
          O <strong>{SITE_NAME}</strong> é uma ferramenta gratuita para criar e compartilhar páginas de anúncio.
          Fornecemos a tecnologia para montar links com ícone, descrição, Pix, QR Code, card para redes e
          cartaz para impressão — <strong>não intermediamos vendas</strong> nem recebemos pagamentos em nome
          dos vendedores.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Responsabilidade do vendedor">
        <p>
          A responsabilidade pelas vendas, entrega de produtos, prestação de serviços, pagamentos via Pix ou
          cartão e veracidade das informações é <strong>100% do vendedor</strong> que gerou o link.
        </p>
        <p>
          O comprador deve sempre confirmar detalhes diretamente com o vendedor antes de concluir qualquer
          transação. O {SITE_NAME} não garante a existência, qualidade ou entrega dos itens anunciados.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Conteúdo do anúncio">
        <p>
          Os anúncios são montados pelo próprio usuário e codificados na URL. Não fazemos upload de imagens nem
          hospedamos fotos dos produtos — o visual do anúncio usa ícones e textos fornecidos por você.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Expiração automática em 30 dias">
        <p>
          Para garantir a segurança do ecossistema, os anúncios expiram automaticamente após{" "}
          <strong>30 dias</strong>. Após esse prazo, os botões de compra são desativados e uma mensagem informa
          que o anúncio foi encerrado, incentivando o vendedor a criar um novo link atualizado.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="Uso adequado">
        <p>
          É proibido utilizar a plataforma para divulgar conteúdo ilegal, fraudulento, ofensivo ou que viole
          direitos de terceiros. Reservamo-nos o direito de bloquear o acesso em casos de uso abusivo, conforme
          permitido pela legislação aplicável.
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
