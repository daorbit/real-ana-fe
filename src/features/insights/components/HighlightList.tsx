import { useState } from "react";
import { Button } from "@mantine/core";
import type { Insight } from "../types";
import { HighlightCard } from "./HighlightCard";
import classes from "./Insights.module.css";

const FIRST_SHOWN = 4;

export function HighlightList({
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
  const [all, setAll] = useState(false);
  const shown = all ? insights : insights.slice(0, FIRST_SHOWN);

  if (!insights.length) return null;

  return (
    <section className={classes.highlights}>
      <div className={classes.highlightsHead}>
        <h2 className={classes.highlightsTitle}>Highlights</h2>
      </div>
      <div className={classes.grid}>
        {shown.map((insight) => (
          <HighlightCard
            key={insight.id}
            insight={insight}
            canTask={canTask}
            tasking={busyId === insight.id}
            onTask={onTask}
          />
        ))}
      </div>
      {insights.length > FIRST_SHOWN && (
        <Button className={classes.showAll} variant="default" radius="xl" onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer highlights" : `Show all highlights (${insights.length})`}
        </Button>
      )}
    </section>
  );
}
