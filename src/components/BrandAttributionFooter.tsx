import { SITE_DOMAIN, SITE_URL } from "../lib/constants";

type BrandAttributionVariant = "checkout" | "create" | "print";

interface BrandAttributionFooterProps {
  variant?: BrandAttributionVariant;
  /** Exibe "Anunciado em: …" em vez de só o domínio */
  withPrefix?: boolean;
  className?: string;
}

/** Rodapé clicável padronizado — Card, página do anúncio e folheto */
export function BrandAttributionFooter({
  variant = "checkout",
  withPrefix = true,
  className = "",
}: BrandAttributionFooterProps) {
  const label = withPrefix ? `Anunciado em: ${SITE_DOMAIN}` : SITE_DOMAIN;

  return (
    <footer className={`brand-attribution brand-attribution--${variant} ${className}`}>
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="brand-attribution__link"
      >
        {label}
      </a>
    </footer>
  );
}
