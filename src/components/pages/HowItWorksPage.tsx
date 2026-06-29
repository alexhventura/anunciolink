import {
  Clock3,
  FilePenLine,
  ImageIcon,
  Link2,
  MessageCircle,
} from "lucide-react";
import { InstitutionalPageLayout, StepCard } from "../InstitutionalPageLayout";
import { SITE_NAME } from "../../lib/constants";

interface HowItWorksPageProps {
  adsenseReady: boolean;
}

export function HowItWorksPage({ adsenseReady }: HowItWorksPageProps) {
  return (
    <InstitutionalPageLayout
      title="Como Funciona"
      subtitle={`O ${SITE_NAME} é uma ferramenta de custo zero: sem cadastro, sem banco de dados e sem taxas. Veja o passo a passo completo.`}
      adsenseReady={adsenseReady}
    >
      <StepCard
        step={1}
        icon={<FilePenLine className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Preenchimento Rápido"
      >
        O vendedor acessa a plataforma e digita o <strong>Título</strong>, o <strong>Preço</strong> e uma{" "}
        <strong>Descrição curta</strong> do produto ou serviço. Em poucos segundos o anúncio já está estruturado
        para compartilhar — sem formulários longos nem etapas desnecessárias.
      </StepCard>

      <StepCard
        step={2}
        icon={<ImageIcon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Foto da Galeria Otimizada"
      >
        O usuário escolhe uma foto direto da galeria do celular. Nossa tecnologia avançada reduz o tamanho da imagem
        em tempo real (HTML Canvas) para caber perfeitamente dentro de um link seguro, sem consumir dados extras nem
        enviar arquivos para servidores externos.
      </StepCard>

      <StepCard
        step={3}
        icon={<Link2 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Geração do Link Inteligente"
      >
        Ao clicar em gerar, um link exclusivo é criado instantaneamente no próprio navegador. Esse link carrega
        todas as informações e a foto criptografada de graça, dispensando bancos de dados, hospedagem de imagens e
        mensalidades.
      </StepCard>

      <StepCard
        step={4}
        icon={<MessageCircle className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Compartilhamento Visual no WhatsApp"
      >
        O vendedor copia o link e, ao colar no WhatsApp, um card de texto super atraente com emojis é gerado
        automaticamente, chamando a atenção dos clientes e direcionando para a página de compra com Pix, cartão e
        contato.
      </StepCard>

      <StepCard
        step={5}
        icon={<Clock3 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Expiração Automática de 30 Dias"
      >
        Para a segurança de todos, após 30 dias o link congela os botões de compra e exibe uma mensagem amigável de
        anúncio encerrado, incentivando a renovação e mantendo a navegação limpa para quem acessa links antigos.
      </StepCard>
    </InstitutionalPageLayout>
  );
}
