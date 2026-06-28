import { SITE_DOMAIN, SITE_NAME } from "../lib/constants";

interface HeaderProps {
  showNewAdButton: boolean;
  onResetHome: () => void;
}

export function Header({ showNewAdButton, onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 px-6 py-4 backdrop-blur-sm no-print">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <button
          type="button"
          onClick={onResetHome}
          className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0"
          aria-label={`${SITE_NAME} — voltar ao início`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-zinc-950">
            A
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-zinc-950">
            anuncio<span className="text-amber-600">link</span>
            <span className="text-zinc-400 font-normal text-xs ml-0.5">.{SITE_DOMAIN.replace("www.", "")}</span>
          </span>
        </button>

        {showNewAdButton && (
          <button type="button" onClick={onResetHome} id="btn-create-new-header" className="btn-accent text-xs">
            Novo anúncio
          </button>
        )}
      </div>
    </header>
  );
}
