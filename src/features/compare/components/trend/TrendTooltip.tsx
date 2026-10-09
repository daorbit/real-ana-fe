import { ColorSwatch } from "@mantine/core";
import { chartDate } from "../../lib/trend";
import classes from "./Trend.module.css";

type Entry = { dataKey?: unknown; value?: unknown; color?: string };

export function TrendTooltip({
  active,
  payload,
  label,
  names,
}: {
  active?: boolean;
  payload?: ReadonlyArray<Entry>;
  label?: unknown;
  names: Map<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const entries = [...payload].sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div className={classes.tooltip}>
      <div className={classes.tipDate}>{chartDate(String(label))}</div>
      {entries.map((entry) => {
        const key = String(entry.dataKey);
        return (
          <div key={key} className={classes.tipRow}>
            <ColorSwatch color={entry.color ?? "gray"} size={8} withShadow={false} />
            <span className={classes.tipName}>{names.get(key) ?? key}</span>
            <span className={classes.tipValue}>{String(entry.value)}</span>
          </div>
        );
      })}
    </div>
  );
}
