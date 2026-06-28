import { SITE_NAME } from "../lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-150 py-10 bg-zinc-100 text-center text-xs text-zinc-500 font-semibold px-4 space-y-2">
      <p className="uppercase tracking-widest text-zinc-600 font-bold">
        ⚡ {SITE_NAME.toUpperCase()} — ANÚNCIOS ULTRA-RÁPIDOS SEM CADASTRO
      </p>
      <p className="text-[10px] leading-relaxed max-w-md mx-auto normal-case font-medium text-zinc-400">
        Criado para desapego, autônomos e vaquinhas. Nenhum dado é mantido em banco de dados centralizado.
      </p>
    </footer>
  );
}
