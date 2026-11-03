import { Lock } from "lucide-react";
import { RANGES } from "../searchMetrics";
import { useSearchEntitlements, useSearchUpgrade } from "../useSearchEntitlements";
import { SearchSegmented } from "./SearchSegmented";

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
    <SearchSegmented
      className={className}
      label="Date range"
      value={String(days)}
      items={RANGES.map((r) => ({
        value: r.value,
        title: locked(r.value) ? `Last ${r.label} · upgrade to unlock` : `Last ${r.label}`,
        label: (
          <>
            {r.short}
            {locked(r.value) && <Lock size={10} aria-hidden />}
          </>
        ),
      }))}
      onChange={(v) => {
        if (disabled) return;
        if (locked(v)) {
          prompt(
            `The ${ent.planName} plan includes the last ${ent.maxDays} days of Google Search data. Upgrade to see longer history.`,
          );
          return;
        }
        onChange(Number(v));
      }}
    />
  );
}
