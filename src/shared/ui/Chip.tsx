import type { ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import { X } from "lucide-react";
import styles from "./Chip.module.css";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  count?: string | null;
  removable?: boolean;
  role?: "tab";
  title?: string;
  onClick?: () => void;
};

export function Chip({ children, active, count, removable, role, title, onClick }: ChipProps) {
  return (
    <UnstyledButton
      role={role}
      aria-selected={role ? Boolean(active) : undefined}
      className={styles.chip}
      data-active={active || undefined}
      data-removable={removable || undefined}
      title={title}
      onClick={onClick}
    >
      {children}
      {count != null && <span className={styles.count}>{count}</span>}
      {removable && <X className={styles.remove} aria-hidden />}
    </UnstyledButton>
  );
}
