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
    <header className="site-header sticky top-0 z-40 px-5 py-4 no-print">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
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

        <SiteNavLink view="como-funciona" onNavigate={onNavigate} highlight>
          Como Funciona
        </SiteNavLink>
      </div>
    </header>
  );
}
