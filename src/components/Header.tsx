import { SITE_DOMAIN, SITE_NAME } from "../lib/constants";

interface HeaderProps {
  showNewAdButton: boolean;
  onResetHome: () => void;
}

export function Header({ showNewAdButton, onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 px-5 py-3.5 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <button
          type="button"
          onClick={onResetHome}
          className="flex items-center gap-2.5 border-0 bg-transparent p-0 cursor-pointer"
          aria-label={`${SITE_NAME} — voltar ao início`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-[11px] font-bold text-white">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-950">
            anuncio<span className="text-amber-600">link</span>
            <span className="text-zinc-400 font-normal text-xs">.{SITE_DOMAIN.replace("www.", "")}</span>
          </span>
        </button>

        {showNewAdButton && (
          <button type="button" onClick={onResetHome} id="btn-create-new-header" className="btn-ghost text-xs !py-2">
            Novo anúncio
          </button>
        )}
      </div>
    </header>
  );
}
