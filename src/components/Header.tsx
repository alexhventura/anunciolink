import { Zap } from "lucide-react";
import { SITE_NAME } from "../lib/constants";

interface HeaderProps {
  showNewAdButton: boolean;
  onResetHome: () => void;
}

export function Header({ onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-black bg-amber-500 px-5 py-4 no-print">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={onResetHome}
          className="flex items-center gap-2 border-0 bg-transparent p-0 cursor-pointer group"
          aria-label={`${SITE_NAME} — voltar ao início`}
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-[3px] border-black bg-amber-400 neo-shadow-sm transition-transform duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[1px_1px_0_0_#000]">
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
          <span className="text-2xl font-black tracking-tight text-black">
            núncio<span className="text-white drop-shadow-[1px_1px_0_#000]">Link</span>
          </span>
        </button>
      </div>
    </header>
  );
}
