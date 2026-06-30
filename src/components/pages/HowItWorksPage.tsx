import {
  Clock3,
  FilePenLine,
  Link2,
  Lock,
  QrCode,
  Share2,
  Shapes,
  Smartphone,
} from "lucide-react";
import { InstitutionalPageLayout, InstitutionalSection, StepCard } from "../InstitutionalPageLayout";
import { SITE_DOMAIN, SITE_NAME } from "../../lib/constants";

interface HowItWorksPageProps {
  adsenseReady: boolean;
}

export function HowItWorksPage({ adsenseReady }: HowItWorksPageProps) {
  return (
    <InstitutionalPageLayout
      title="Como Funciona"
      subtitle={`O ${SITE_NAME} cria páginas de anúncio profissionais em segundos — sem cadastro, sem banco de dados e sem taxas. Veja o passo a passo completo.`}
      adsenseReady={adsenseReady}
    >
      <StepCard
        step={1}
        icon={<FilePenLine className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Monte seu anúncio"
      >
        Informe <strong>título</strong>, <strong>preço</strong> e <strong>descrição</strong>. Escolha o tipo
        (venda, serviço ou vaquinha) e se o valor é único ou mensal. Tudo em um formulário curto — sem
        cadastro e sem etapas desnecessárias.
      </StepCard>

      <StepCard
        step={2}
        icon={<Shapes className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Personalize com ícone e pagamento"
      >
        Opcionalmente, escolha um <strong>ícone</strong> que representa seu produto ou serviço, adicione{" "}
        <strong>WhatsApp</strong>, <strong>Pix copia e cola</strong> e <strong>link de cartão</strong> (Mercado
        Pago, Stripe, etc.). A prévia ao lado mostra exatamente como o card do anúncio ficará.
      </StepCard>

      <StepCard
        step={3}
        icon={<Lock className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Senha opcional no link"
      >
        Nos campos extras, você pode definir uma <strong>senha de até 4 caracteres</strong> (letras e
        números). O anúncio é criptografado na própria URL com AES — sem servidor. Quem receber o link
        vê uma tela de desbloqueio; só com a senha correta o card, Pix e WhatsApp aparecem.
      </StepCard>

      <StepCard
        step={4}
        icon={<Link2 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Gere o link do anúncio"
      >
        Ao clicar em <strong>Gerar anúncio grátis</strong>, tudo é compactado e codificado dentro de um link
        exclusivo — direto no seu navegador. Não usamos servidor para guardar seus dados: o anúncio viaja na
        própria URL.
      </StepCard>

      <StepCard
        step={5}
        icon={<Share2 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Divulgue em qualquer canal"
      >
        Na tela de sucesso use <strong>Compartilhar</strong> para enviar a imagem do card com o link pelo menu
        do celular (WhatsApp, Instagram, Telegram e outros). Também há <strong>Copiar link</strong>,{" "}
        <strong>PDF</strong> e <strong>JPG</strong> — ambos abrem prévia para impressão na sua máquina.
      </StepCard>

      <StepCard
        step={6}
        icon={<QrCode className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Cartaz A4 em JPG e PDF"
      >
        O QR Code leva o favicon do site no centro. <strong>JPG</strong> e <strong>PDF</strong> usam o
        mesmo layout A4 — só muda a extensão. Ideal para impressão, compartilhamento e redes.
      </StepCard>

      <StepCard
        step={7}
        icon={<Smartphone className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="O comprador abre a página do anúncio"
      >
        Quem recebe o link vê o card completo com ícone, preço e descrição. Se você informou pagamento, aparecem
        botões de <strong>Pix</strong> e <strong>cartão</strong>; com telefone, há atalho direto para{" "}
        <strong>WhatsApp</strong>. Quem já está na página pode copiar o link ou baixar um QR discreto para uso
        offline.
      </StepCard>

      <StepCard
        step={8}
        icon={<Clock3 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />}
        title="Validade e histórico local"
      >
        Anúncios de <strong>venda</strong> expiram automaticamente em <strong>30 dias</strong> — os botões de
        compra são desativados e uma mensagem orienta a renovar. <strong>Serviços</strong> e{" "}
        <strong>vaquinhas</strong> permanecem ativos sem prazo, ideais para pagamentos recorrentes. Na home,{" "}
        <strong>Meus anúncios</strong> guarda seus links recentes só no seu navegador (sem conta), com opções
        de compartilhar, copiar link e baixar PDF/JPG de cada item.
      </StepCard>

      <InstitutionalSection title="O que está incluso — sempre grátis">
        <ul className="list-disc pl-5 space-y-2">
          <li>Página de anúncio com visual Bento (mostarda e preto)</li>
          <li>Ícone personalizado por categoria</li>
          <li>Pix, cartão e WhatsApp na página do comprador</li>
          <li>QR Code com favicon {SITE_NAME}</li>
          <li>Cartaz A4 em JPG e PDF — layout idêntico</li>
          <li>Senha opcional (até 4 caracteres) com criptografia na URL</li>
          <li>Compartilhar nativo (imagem + link), copiar link, PDF e JPG</li>
          <li>Indicador de peso do link (payload) na prévia</li>
        </ul>
        <p className="mt-3 text-sm text-zinc-600">
          Não há upload de fotos, temas extras nem servidor de dados. Tudo em{" "}
          <strong>{SITE_DOMAIN}</strong> — custo zero para você.
        </p>
      </InstitutionalSection>

      <InstitutionalSection title="O que o Anuncio Link não faz">
        <p>
          Não intermediamos pagamentos, não guardamos dinheiro e não validamos produtos. Pix e cartão vão
          direto para o vendedor. Não exigimos cadastro, e-mail ou aplicativo instalado — basta o navegador.
        </p>
      </InstitutionalSection>
    </InstitutionalPageLayout>
  );
}
