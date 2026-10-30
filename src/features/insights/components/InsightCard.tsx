import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { ArrowUpRight, ListPlus } from "lucide-react";
import { comparisonLabel, deltaLabel, insightHref, KIND_ICON } from "../lib/insight";
import type { Insight } from "../types";
import classes from "./Insights.module.css";

export function InsightCard({
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
  const delta = deltaLabel(insight);

  return (
    <article className={classes.card}>
      <div className={classes.cardTop}>
        <span className={classes.icon} data-tone={insight.tone}>
          <Icon size={18} />
        </span>
        <div className={classes.text}>
          <span className={classes.title}>{insight.title}</span>
          <span className={classes.body}>{insight.body}</span>
        </div>
        {delta && (
          <span className={classes.delta} data-tone={insight.tone}>
            {delta}
          </span>
        )}
      </div>
      <div className={classes.cardFoot}>
        <span className={classes.compare}>{comparisonLabel(insight)}</span>
        {canTask && (
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            leftSection={<ListPlus size={14} />}
            loading={tasking}
            onClick={() => onTask(insight)}
          >
            Create task
          </Button>
        )}
        <Button
          component={Link}
          to={insightHref(insight)}
          variant="subtle"
          color="gray"
          size="compact-sm"
          rightSection={<ArrowUpRight size={14} />}
        >
          View in analytics
        </Button>
      </div>
    </article>
  );
}
