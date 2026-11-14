import type { ReactNode } from "react";

export function BioLinkAnchor({
  href,
  interactive,
  className,
  shape,
  onClick,
  children,
}: {
  href: string;
  interactive: boolean;
  className: string;
  shape?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (!interactive) {
    return (
      <span className={className} data-shape={shape}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} data-shape={shape} onClick={onClick}>
      {children}
    </a>
  );
}
