import { useRef, type ReactNode } from "react";
import { useBioAccent } from "@/features/bio/hooks/useBioAccent";
import type { BioTheme } from "@/features/bio/types";

export function BioFrame({
  theme,
  variant,
  className,
  children,
}: {
  theme: BioTheme;
  variant: "page" | "preview";
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useBioAccent(ref, theme.accent);

  return (
    <div
      ref={ref}
      className={className}
      data-appearance={theme.appearance}
      data-background={theme.background}
      data-font={theme.font}
      data-variant={variant}
    >
      {children}
    </div>
  );
}
