import { getAdIconDefinition, resolveAdIconId } from "../lib/adIcons";
import type { AdIconId } from "../lib/adIcons";
import type { AdType } from "../types/ad";
import { LazyLucideIcon } from "./LazyLucideIcon";

interface AdProductIconProps {
  iconId?: AdIconId;
  adType?: AdType;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

/** Renderiza ícone Lucide do catálogo por ID compacto (carregamento sob demanda) */
export function AdProductIcon({
  iconId,
  adType = "venda",
  size = 48,
  strokeWidth = 2.25,
  className = "",
  color,
}: AdProductIconProps) {
  const resolvedId = resolveAdIconId(iconId, adType);
  const definition = getAdIconDefinition(resolvedId);
  if (!definition) return null;

  return (
    <LazyLucideIcon
      lucideKey={definition.lucideKey}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
    />
  );
}
