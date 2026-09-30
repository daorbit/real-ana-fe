import { SegmentedControl } from "@mantine/core";
import { DASHBOARD_RANGES } from "@/features/dashboards/types";
import type { DashboardRange } from "@/features/dashboards/types";

export function RangeControl({
  value,
  allowed,
  onChange,
}: {
  value: DashboardRange;
  allowed: (range: DashboardRange) => boolean;
  onChange: (range: DashboardRange) => void;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as DashboardRange)}
      data={DASHBOARD_RANGES.map((r) => ({ value: r.value, label: r.label, disabled: !allowed(r.value) }))}
      aria-label="Date range"
    />
  );
}
