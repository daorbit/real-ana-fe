import { Text, Tooltip } from "@mantine/core";
import { num } from "@/shared/lib";
import type { BreakdownComparisonRow } from "@/shared/types";

export type BreakdownCompareHook = (
  dimension: string,
  enabled: boolean,
) => { rows: BreakdownComparisonRow[] | undefined; loading: boolean };

export const NO_COMPARE: BreakdownCompareHook = () => ({ rows: undefined, loading: false });

export function BreakdownDelta({ row }: { row?: BreakdownComparisonRow }) {
  if (!row) return null;
  const { delta: pct, previous } = row;

  if (previous === 0) {
    return <Text size="xs" c="emerald" fw={600}>new</Text>;
  }
  if (pct === null) return <Text size="xs" c="dimmed">—</Text>;

  const up = pct > 0;
  const flat = pct === 0;
  return (
    <Tooltip label={`${num(previous)} in the baseline period`} withArrow>
      <Text size="xs" fw={600} c={flat ? "dimmed" : up ? "emerald" : "red"}>
        {flat ? "±0%" : `${up ? "+" : ""}${pct}%`}
      </Text>
    </Tooltip>
  );
}
