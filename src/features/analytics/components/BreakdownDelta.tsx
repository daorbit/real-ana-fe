import { Tooltip } from "@mantine/core";
import { num } from "@/shared/lib";
import type { BreakdownComparisonRow } from "@/shared/types";
import classes from "./BreakdownDelta.module.css";

export type BreakdownCompareHook = (
  dimension: string,
  enabled: boolean,
) => { rows: BreakdownComparisonRow[] | undefined; loading: boolean };

export const NO_COMPARE: BreakdownCompareHook = () => ({ rows: undefined, loading: false });

export function BreakdownDelta({ row }: { row?: BreakdownComparisonRow }) {
  if (!row) return <span className={classes.delta}>—</span>;
  const { delta: pct, previous } = row;

  if (previous === 0) {
    return (
      <span className={classes.delta} data-dir="up">
        New
      </span>
    );
  }
  if (pct === null) return <span className={classes.delta}>—</span>;

  const up = pct > 0;
  const flat = pct === 0;
  return (
    <Tooltip label={`${num(previous)} in the baseline period`} withArrow>
      <span className={classes.delta} data-dir={flat ? undefined : up ? "up" : "down"}>
        {flat ? "±0%" : `${up ? "+" : ""}${pct}%`}
      </span>
    </Tooltip>
  );
}
