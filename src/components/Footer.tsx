import { SITE_NAME } from "../lib/constants";

export function Footer() {
  return (
    <footer className="site-footer mt-20 py-10 text-center px-6 no-print">
      <p className="text-sm font-black uppercase text-black">{SITE_NAME}</p>
      <p className="mt-2 text-xs font-medium text-zinc-600 max-w-sm mx-auto">
        Anúncios na URL. Zero servidor. Máxima velocidade.
      </p>
    </footer>
  );
}
