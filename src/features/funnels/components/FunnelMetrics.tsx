import { num } from "@/shared/lib";
import type { FunnelReport } from "@/shared/types";
import { percentLabel, pointChange, relativeChange, type Tone } from "../lib/funnelFormat";
import classes from "./FunnelResults.module.css";

type Metric = {
  label: string;
  value: string;
  note: string;
  change: { label: string; tone: Tone } | null;
  tone?: "loss";
};

export function FunnelMetrics({ report }: { report: FunnelReport }) {
  const steps = report.steps;
  const current = report.current;
  const previous = report.previous ?? null;
  const entered = current?.entered ?? steps[0]?.count ?? 0;
  const completed = current?.completed ?? steps[steps.length - 1]?.count ?? 0;
  const conversion = current?.conversion ?? steps[steps.length - 1]?.rate ?? 0;
  const worst = report.biggestDrop ?? null;

  const metrics: Metric[] = [
    { label: "Conversion", value: percentLabel(conversion), note: "First step to last", change: pointChange(conversion, previous?.conversion) },
    { label: "Entered", value: num(entered), note: "Sessions at step 1", change: relativeChange(entered, previous?.entered) },
    { label: "Completed", value: num(completed), note: `Reached step ${steps.length}`, change: relativeChange(completed, previous?.completed) },
    worst
      ? {
          label: "Biggest leak",
          value: `−${percentLabel(worst.dropFromPrev)}`,
          note: `Step ${worst.index} to ${worst.index + 1} · ${num(worst.dropped)} lost`,
          change: null,
          tone: "loss",
        }
      : { label: "Biggest leak", value: "None", note: "Everyone continued", change: null },
  ];

  return (
    <dl className={classes.metrics}>
      {metrics.map((m) => (
        <div key={m.label} className={classes.metric} data-tone={m.tone}>
          <dt>{m.label}</dt>
          <dd>
            <span className={classes.metricValue}>{m.value}</span>
            {m.change && (
              <span className={classes.change} data-tone={m.change.tone}>
                {m.change.label}
              </span>
            )}
          </dd>
          <span className={classes.metricNote}>{m.note}</span>
        </div>
      ))}
    </dl>
  );
}
