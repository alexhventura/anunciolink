import { Zap } from "lucide-react";
import type { AppView } from "../types/ad";
import { SITE_NAME } from "../lib/constants";
import { SiteNavLink } from "./InstitutionalPageLayout";

interface HeaderProps {
  onResetHome: () => void;
  onNavigate: (view: AppView) => void;
}

export function Header({ onResetHome, onNavigate }: HeaderProps) {
  return (
    <header className="site-header sticky top-0 z-40 px-4 sm:px-5 py-3 sm:py-4 no-print">
      <div className="site-header__inner mx-auto flex w-full max-w-6xl min-w-0 flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="site-header__brand-row flex w-full justify-center sm:w-auto sm:justify-start">
          <button
            type="button"
            onClick={onResetHome}
            className="group flex min-w-0 items-center gap-2 border-0 bg-transparent p-0 cursor-pointer"
            aria-label={`${SITE_NAME} — voltar ao início`}
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg site-header__logo">
              <span className="font-black text-xl leading-none text-black select-none" aria-hidden="true">
                A
              </span>
              <Zap
                className="absolute -right-2 -top-2 h-5 w-5"
                fill="#fbbf24"
                stroke="#000"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </span>
            <span className="truncate text-xl sm:text-2xl font-black tracking-tight text-black">
              núncio<span className="text-white drop-shadow-[1px_1px_0_#000]">Link</span>
            </span>
          </button>
        </div>

        <nav
          className="site-header__nav-row flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto sm:justify-end sm:gap-3"
          aria-label="Navegação principal"
        >
          <SiteNavLink
            view="meus-anuncios"
            onNavigate={onNavigate}
            className="text-[10px] sm:text-xs whitespace-nowrap"
          >
            Meus Anúncios
          </SiteNavLink>
          <SiteNavLink
            view="como-funciona"
            onNavigate={onNavigate}
            highlight
            className="text-[10px] sm:text-xs whitespace-nowrap"
          >
            Como Funciona
          </SiteNavLink>
        </nav>
      </div>
    </header>
  );
}
