import type { ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import styles from "./InsetList.module.css";

export function InsetList({
  header,
  footer,
  children,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.group}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.list}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}

export function InsetRow({
  leading,
  title,
  subtitle,
  trailing,
  chevron = false,
  onClick,
  tone,
  disabled = false,
  ariaLabel,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  tone?: "danger" | "accent";
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const body = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.main}>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
        {trailing && <span className={styles.trailing}>{trailing}</span>}
        {chevron && <ChevronRight size={16} className={styles.chevron} />}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <div className={styles.row} data-tone={tone}>
        {body}
      </div>
    );
  }

  return (
    <UnstyledButton
      className={styles.row}
      data-tone={tone}
      data-interactive
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {body}
    </UnstyledButton>
  );
}

export function RowIcon({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "teal" | "orange" | "red" | "blue" | "violet" }) {
  return (
    <span className={styles.icon} data-tone={tone}>
      {children}
    </span>
  );
}
