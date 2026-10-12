import { UnstyledButton } from "@mantine/core";
import styles from "./FilterChips.module.css";

export type FilterChip = { value: string; label: string; count?: string | null };

export function FilterChips({
  value,
  onChange,
  data,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  data: FilterChip[];
  ariaLabel: string;
}) {
  return (
    <div className={styles.scroller} role="tablist" aria-label={ariaLabel}>
      {data.map((chip) => {
        const active = chip.value === value;
        return (
          <UnstyledButton
            key={chip.value}
            role="tab"
            aria-selected={active}
            className={styles.chip}
            data-active={active || undefined}
            onClick={() => onChange(chip.value)}
          >
            {chip.label}
            {chip.count != null && <span className={styles.count}>{chip.count}</span>}
          </UnstyledButton>
        );
      })}
    </div>
  );
}
