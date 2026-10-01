import { useState } from "react";
import { SegmentedControl, Tooltip } from "@mantine/core";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { SeoCompareVerdict, SeoMetricComparison } from "@/shared/types";
import classes from "./Compare.module.css";

type SortMode = "impact" | "listed";

const HIGH_IMPACT = 0.05;

function orderMetrics(metrics: SeoMetricComparison[], mode: SortMode): SeoMetricComparison[] {
  if (mode === "listed") return metrics;
  const score = metrics.filter((m) => m.id === "score");
  const rest = metrics.filter((m) => m.id !== "score").sort((a, b) => b.impact - a.impact);
  return [...score, ...rest];
}

function VerdictMark({ verdict, tieReason }: { verdict: SeoCompareVerdict; tieReason?: string }) {
  const label =
    verdict === "lose" ? "They beat you here" : verdict === "win" ? "You beat them here" : tieReason ?? "Both pages measure the same here.";
  const Icon = verdict === "lose" ? ArrowUp : verdict === "win" ? ArrowDown : Minus;
  return (
    <Tooltip label={label} withArrow multiline={Boolean(tieReason)} w={tieReason ? 250 : undefined}>
      <Icon size={13} className={classes.verdict} data-verdict={verdict} />
    </Tooltip>
  );
}

function CheckLabel({ metric }: { metric: SeoMetricComparison }) {
  const content = (
    <span className={classes.checkLabel} data-hint={metric.note ? true : undefined}>
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

  return (
    <section className={`${classes.card} ${classes.checks}`}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Every check</h3>
          <p className={classes.cardSub}>
            {losing === 0 ? "You match or beat them everywhere" : `Behind on ${losing} of ${metrics.length}`}
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

      <div className={`${classes.checkGrid} ${classes.checkHead}`}>
        <span>Check</span>
        <span className={classes.checkHeadYou}>You</span>
        <span className={classes.checkHeadThem}>{label}</span>
      </div>

      {rows.map((m) => (
        <div key={m.id} className={`${classes.checkGrid} ${classes.checkRow}`}>
          <CheckLabel metric={m} />
          <span className={classes.checkValue}>{m.mine}</span>
          <span className={classes.checkValue} data-verdict={m.verdict}>
            <VerdictMark verdict={m.verdict} tieReason={m.tieReason} />
            {m.theirs}
          </span>
        </div>
      ))}
    </section>
  );
}
