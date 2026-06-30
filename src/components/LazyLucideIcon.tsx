import { lazy, Suspense, useMemo, type ComponentType } from "react";
import { loadAdIcon, type LucideSvgIcon } from "../lib/adIconLoaders";

const iconCache = new Map<string, ComponentType<LucideSvgIcon>>();

function getLazyIcon(lucideKey: string): ComponentType<LucideSvgIcon> | null {
  if (iconCache.has(lucideKey)) return iconCache.get(lucideKey)!;

  const loader = loadAdIcon(lucideKey);
  if (!loader) return null;

  const LazyIcon = lazy(loader);
  iconCache.set(lucideKey, LazyIcon);
  return LazyIcon;
}

export interface LazyLucideIconProps {
  lucideKey: string;
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  color?: string;
}

function IconPlaceholder({ size = 24 }: { size?: number | string }) {
  const px = typeof size === "number" ? size : 24;
  return (
    <span
      className="inline-block shrink-0"
      style={{ width: px, height: px }}
      aria-hidden="true"
    />
  );
}

/** Carrega um ícone Lucide sob demanda — evita bundle com 120 ícones na rota /a/ */
export function LazyLucideIcon({
  lucideKey,
  size = 24,
  strokeWidth = 2.25,
  className = "",
  color,
}: LazyLucideIconProps) {
  const Icon = useMemo(() => getLazyIcon(lucideKey), [lucideKey]);
  if (!Icon) return <IconPlaceholder size={size} />;

  return (
    <Suspense fallback={<IconPlaceholder size={size} />}>
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        color={color}
        aria-hidden="true"
      />
    </Suspense>
  );
}
