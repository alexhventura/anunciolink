import { SITE_DOMAIN, SITE_NAME } from "../lib/constants";

interface HeaderProps {
  showNewAdButton: boolean;
  onResetHome: () => void;
}

export function Header({ showNewAdButton, onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100/80 bg-white/95 px-6 py-4 backdrop-blur-md shadow-soft-premium no-print">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <button
          type="button"
          onClick={onResetHome}
          className="flex cursor-pointer items-center gap-2 group select-none border-0 bg-transparent p-0"
          aria-label={`${SITE_NAME} — voltar ao início`}
        >
          <span className="text-2xl transition-transform group-hover:scale-110 duration-300" aria-hidden="true">
            ⚡
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-zinc-950">
            anuncio<span className="text-amber-600">link</span>
            <span className="text-zinc-400 font-medium text-xs">.{SITE_DOMAIN.replace("www.", "")}</span>
          </span>
        </button>

        {showNewAdButton && (
          <button
            type="button"
            onClick={onResetHome}
            id="btn-create-new-header"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-all active:scale-95 shadow-soft-premium"
          >
            ➕ Novo Anúncio
          </button>
        )}
      </div>
    </header>
  );
}
