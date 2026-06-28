import { SITE_NAME } from "../lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 py-12 bg-white text-center px-6 no-print">
      <p className="text-sm font-semibold text-zinc-800 tracking-tight">{SITE_NAME}</p>
      <p className="mt-2 text-xs text-zinc-500 font-normal max-w-sm mx-auto leading-relaxed">
        Anúncios instantâneos na URL. Sem banco de dados, sem cadastro.
      </p>
    </footer>
  );
}
