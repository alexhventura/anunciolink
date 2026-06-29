import type { AppView } from "../types/ad";
import { SITE_NAME } from "../lib/constants";
import { SiteNavLink } from "./InstitutionalPageLayout";

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer mt-20 py-10 text-center px-6 no-print">
      <p className="text-sm font-black uppercase text-black">{SITE_NAME}</p>
      <p className="mt-2 text-xs font-medium text-zinc-600 max-w-sm mx-auto">
        Anúncios na URL. Zero servidor. Máxima velocidade.
      </p>

      <nav className="site-footer__nav mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2" aria-label="Links institucionais">
        <SiteNavLink view="como-funciona" onNavigate={onNavigate} highlight>
          Como Funciona
        </SiteNavLink>
        <span className="text-zinc-400 select-none" aria-hidden="true">
          ·
        </span>
        <SiteNavLink view="sobre" onNavigate={onNavigate}>
          Sobre
        </SiteNavLink>
        <span className="text-zinc-400 select-none" aria-hidden="true">
          ·
        </span>
        <SiteNavLink view="privacidade" onNavigate={onNavigate}>
          Privacidade e Cookies
        </SiteNavLink>
        <span className="text-zinc-400 select-none" aria-hidden="true">
          ·
        </span>
        <SiteNavLink view="termos" onNavigate={onNavigate}>
          Termos de Uso
        </SiteNavLink>
      </nav>
    </footer>
  );
}
