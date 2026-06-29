import type { ElementType, ReactNode } from "react";

interface ViewEnterProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  itemScope?: boolean;
  itemType?: string;
}

/** Entrada suave via CSS — evita carregar o bundle motion na rota inicial */
export function ViewEnter({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: ViewEnterProps) {
  return (
    <Tag className={`view-enter ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
