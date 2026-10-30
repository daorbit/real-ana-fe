import { Progress } from "@mantine/core";
import { barsOf } from "../lib/insight";
import type { Insight } from "../types";
import classes from "./Insights.module.css";

function Bar({ value, caption, pct, past }: { value: string; caption: string; pct: number; past?: boolean }) {
  return (
    <div className={classes.barRow}>
      <span className={classes.barLabel}>
        <span className={classes.barValue}>{value}</span>
        <span className={classes.barCaption}>{caption}</span>
      </span>
      <Progress
        value={pct}
        size={10}
        radius="xl"
        color={past ? "color-mix(in srgb, var(--text) 22%, transparent)" : "var(--kind)"}
        classNames={{ root: classes.barTrack, section: classes.barFill }}
        aria-label={`${caption}: ${value}`}
      />
    </div>
  );
}

export function CompareBars({ insight }: { insight: Insight }) {
  const bars = barsOf(insight);
  return (
    <div className={classes.bars}>
      <Bar value={bars.current.value} caption="This week" pct={bars.current.pct} />
      <Bar value={bars.previous.value} caption="Last week" pct={bars.previous.pct} past />
    </div>
  );
}
