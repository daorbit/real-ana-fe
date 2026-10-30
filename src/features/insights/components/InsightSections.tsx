import { SECTIONS } from "../lib/insight";
import type { Insight } from "../types";
import { InsightCard } from "./InsightCard";
import classes from "./Insights.module.css";

export function InsightSections({
  insights,
  canTask,
  busyId,
  onTask,
}: {
  insights: Insight[];
  canTask: boolean;
  busyId: string | null;
  onTask: (insight: Insight) => void;
}) {
  return (
    <>
      {SECTIONS.map(({ tone, title }) => {
        const items = insights.filter((i) => i.tone === tone);
        if (!items.length) return null;
        return (
          <section key={tone} className={classes.section}>
            <div className={classes.sectionHead}>
              <span className={classes.dot} data-tone={tone} />
              <span className={classes.sectionTitle}>{title}</span>
              <span className={classes.sectionCount}>{items.length}</span>
            </div>
            <div className={classes.grid}>
              {items.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  canTask={canTask}
                  tasking={busyId === insight.id}
                  onTask={onTask}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
