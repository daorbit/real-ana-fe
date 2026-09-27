import { Select } from "@mantine/core";
import { CalendarDays, Lock } from "lucide-react";
import { RANGES } from "../searchMetrics";
import { useSearchEntitlements, useSearchUpgrade } from "../useSearchEntitlements";
import classes from "./searchConsole.module.css";

export function SearchRangeSelect({
  days,
  onChange,
  disabled,
  className,
}: {
  days: number;
  onChange: (days: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const ent = useSearchEntitlements();
  const { prompt } = useSearchUpgrade();
  const locked = (value: string) => Number(value) > ent.maxDays;

  return (
    <Select
      size="sm"
      className={className}
      aria-label="Date range"
      leftSection={<CalendarDays size={14} />}
      data={RANGES.map((r) => ({ value: r.value, label: `Last ${r.label}` }))}
      value={String(days)}
      onChange={(v) => {
        if (!v) return;
        if (locked(v)) {
          prompt(
            `The ${ent.planName} plan includes the last ${ent.maxDays} days of Google Search data. Upgrade to see longer history.`,
          );
          return;
        }
        onChange(Number(v));
      }}
      renderOption={({ option }) => (
        <span className={classes.rangeOption} data-locked={locked(option.value) || undefined}>
          {option.label}
          {locked(option.value) && <Lock size={12} />}
        </span>
      )}
      allowDeselect={false}
      disabled={disabled}
    />
  );
}
