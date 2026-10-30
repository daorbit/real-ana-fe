import { Chip } from "./Chip";
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
      {data.map((chip) => (
        <Chip
          key={chip.value}
          role="tab"
          active={chip.value === value}
          count={chip.count}
          onClick={() => onChange(chip.value)}
        >
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}
