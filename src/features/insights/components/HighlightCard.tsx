import { UnstyledButton } from "@mantine/core";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { changeLabel, insightHref, KIND_ICON, KIND_LABEL } from "../lib/insight";
import type { Insight } from "../types";
import { CompareBars } from "./CompareBars";
import classes from "./Insights.module.css";

export function HighlightCard({
  insight,
  canTask,
  tasking,
  onTask,
}: {
  insight: Insight;
  canTask: boolean;
  tasking: boolean;
  onTask: (insight: Insight) => void;
}) {
  const Icon = KIND_ICON[insight.kind];
  const Trend = (insight.delta ?? 1) < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <article className={classes.card} data-kind={insight.kind}>
      <div className={classes.cardHead}>
        <span className={classes.category}>
          <Icon size={15} strokeWidth={2.2} />
          {KIND_LABEL[insight.kind]}
        </span>
        <span className={classes.when} data-tone={insight.tone}>
          {insight.tone !== "info" && <Trend size={14} strokeWidth={2.4} />}
          {changeLabel(insight)}
        </span>
      </div>

      <p className={classes.headline}>{insight.title}</p>

      <CompareBars insight={insight} />

      <div className={classes.links}>
        <Link to={insightHref(insight)} className={classes.link}>
          Show in Analytics
          <ChevronRight size={15} />
        </Link>
        {canTask && (
          <UnstyledButton className={classes.link} disabled={tasking} onClick={() => onTask(insight)}>
            {tasking ? "Adding…" : "Add to Tasks"}
          </UnstyledButton>
        )}
      </div>
    </article>
  );
}
