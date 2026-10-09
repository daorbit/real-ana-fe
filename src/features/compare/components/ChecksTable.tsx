import { useState } from "react";
import { SegmentedControl, Tooltip } from "@mantine/core";
import type { SeoCompareVerdict, SeoMetricComparison } from "@/shared/types";
import classes from "./Checks.module.css";
import shared from "./Compare.module.css";

type SortMode = "impact" | "listed";

const HIGH_IMPACT = 0.05;

const VERDICT_TEXT: Record<SeoCompareVerdict, string> = {
  lose: "Behind",
  win: "Ahead",
  tie: "Even",
};

function orderMetrics(metrics: SeoMetricComparison[], mode: SortMode): SeoMetricComparison[] {
  if (mode === "listed") return metrics;
  const score = metrics.filter((m) => m.id === "score");
  const rest = metrics.filter((m) => m.id !== "score").sort((a, b) => b.impact - a.impact);
  return [...score, ...rest];
}

function VerdictPill({ verdict, tieReason }: { verdict: SeoCompareVerdict; tieReason?: string }) {
  const label =
    verdict === "lose" ? "They beat you here" : verdict === "win" ? "You beat them here" : tieReason ?? "Both pages measure the same here.";
  return (
    <Tooltip label={label} withArrow multiline={Boolean(tieReason)} w={tieReason ? 250 : undefined}>
      <span className={classes.pill} data-verdict={verdict}>
        {VERDICT_TEXT[verdict]}
      </span>
    </Tooltip>
  );
}

function CheckLabel({ metric }: { metric: SeoMetricComparison }) {
  const content = (
    <span className={classes.label} data-hint={metric.note ? true : undefined}>
      {metric.label}
      {metric.impact >= HIGH_IMPACT && <span className={classes.impact}>High impact</span>}
    </span>
  );
  if (!metric.note) return content;
  return (
    <Tooltip label={metric.note} withArrow multiline w={280} position="top-start">
      {content}
    </Tooltip>
  );
}

export function ChecksTable({ metrics, label }: { metrics: SeoMetricComparison[]; label: string }) {
  const [sortMode, setSortMode] = useState<SortMode>("impact");
  const rows = orderMetrics(metrics, sortMode);
  const losing = metrics.filter((m) => m.verdict === "lose").length;
  const winning = metrics.filter((m) => m.verdict === "win").length;

  return (
    <section className={`${shared.card} ${classes.card} glass`}>
      <div className={`${shared.cardHead} ${classes.head}`}>
        <div>
          <h3 className={shared.cardTitle}>Every check</h3>
          <p className={shared.cardSub}>
            {losing === 0
              ? `You match or beat them on all ${metrics.length}`
              : `Behind on ${losing}, ahead on ${winning}, of ${metrics.length}`}
          </p>
        </div>
        <SegmentedControl
          size="xs"
          radius="md"
          value={sortMode}
          onChange={(v) => setSortMode(v as SortMode)}
          data={[
            { label: "Biggest gaps", value: "impact" },
            { label: "Grouped", value: "listed" },
          ]}
        />
      </div>

      <div className={`${classes.grid} ${classes.columns}`}>
        <span>Check</span>
        <span className={classes.you}>You</span>
        <span className={classes.them}>{label}</span>
        <span className={classes.result}>Result</span>
      </div>

      {rows.map((m) => (
        <div key={m.id} className={`${classes.grid} ${classes.row}`} data-verdict={m.verdict}>
          <CheckLabel metric={m} />
          <span className={classes.value}>{m.mine}</span>
          <span className={classes.value}>{m.theirs}</span>
          <span className={classes.result}>
            <VerdictPill verdict={m.verdict} tieReason={m.tieReason} />
          </span>
        </div>
      ))}
    </section>
  );
}
