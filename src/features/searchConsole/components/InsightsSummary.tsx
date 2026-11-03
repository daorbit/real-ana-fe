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

  return (
    <section className={classes.summary} aria-label="Insights summary">
      <div className={classes.summaryMain}>
        <p className={classes.summaryTitle}>
          {actions.length
            ? `${actions.length} thing${actions.length === 1 ? "" : "s"} to do this period`
            : "Nothing needs your attention right now"}
        </p>
        <p className={classes.summarySub}>
          Ranked by clicks to gain or win back, from {num(queries)} queries and {num(pages)} pages in the last {days}{" "}
          days.
        </p>
      </div>
      <div className={classes.kindCounts}>
        {ACTION_KINDS.map((k) => (
          <span key={k.id} className={classes.kindCount} data-kind={k.id}>
            {count(k.id)} {k.label.toLowerCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
