import { Text } from "@mantine/core";
import { num } from "@/shared/lib";
import { ACTION_KINDS, type ActionKind, type InsightAction } from "../insightActions";
import classes from "./insights.module.css";

export function InsightsSummary({
  actions,
  days,
  queries,
  pages,
}: {
  actions: InsightAction[];
  days: number;
  queries: number;
  pages: number;
}) {
  const count = (kind: ActionKind) => actions.filter((a) => a.kind === kind).length;
  const topOpportunity = actions.find((a) => a.kind === "opportunity");

  return (
    <div className={classes.summary}>
      <div className={classes.summaryMain}>
        <div>
          <Text className={classes.summaryTitle}>
            {actions.length
              ? `${actions.length} thing${actions.length === 1 ? "" : "s"} you can do to grow search traffic`
              : "Nothing needs your attention right now"}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            From {num(queries)} queries and {num(pages)} pages on Google, last {days} days vs the {days} before.
          </Text>
          <div className={classes.kindCounts}>
            {ACTION_KINDS.map((k) => (
              <span key={k.id} className={classes.kindCount} data-kind={k.id}>
                <span className={classes.kindDot} />
                <b>{count(k.id)}</b> {k.label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {topOpportunity && (
        <div className={classes.highlight}>
          <Text className={classes.highlightLabel}>Biggest opportunity</Text>
          <Text className={classes.highlightValue}>{topOpportunity.impact}</Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {topOpportunity.title}
          </Text>
        </div>
      )}
    </div>
  );
}
