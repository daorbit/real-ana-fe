import { num } from "@/shared/lib/format";
import { MIN_SESSIONS_FOR_WINNER, verdictText } from "@/features/experiments/lib/resultsCopy";
import { percent } from "@/features/experiments/lib/experimentLabels";
import type { Experiment, ExperimentResults } from "@/features/experiments/types";
import classes from "../Experiments.module.css";

const DAY = 24 * 60 * 60 * 1000;

function daysRunning(experiment: Experiment): number {
  if (!experiment.startedAt) return 0;
  const end = experiment.endedAt ? new Date(experiment.endedAt).getTime() : Date.now();
  return Math.max(1, Math.ceil((end - new Date(experiment.startedAt).getTime()) / DAY));
}

export function ResultsSummary({ experiment, results }: { experiment: Experiment; results: ExperimentResults }) {
  const leader = results.variants.find((v) => v.key === results.leader);
  const days = daysRunning(experiment);

  return (
    <>
      <div className={classes.summary}>
        <div className={classes.summaryItem}>
          <div className={classes.summaryLabel}>Visitors in the test</div>
          <div className={classes.summaryValue}>{num(results.totalSessions)}</div>
        </div>
        <div className={classes.summaryItem}>
          <div className={classes.summaryLabel}>Days running</div>
          <div className={classes.summaryValue}>{days ? num(days) : "Not started"}</div>
        </div>
        <div className={classes.summaryItem}>
          <div className={classes.summaryLabel}>Best conversion</div>
          <div className={classes.summaryValue}>{leader ? `${percent(leader.rate)} · ${leader.name}` : "–"}</div>
        </div>
        <div className={classes.summaryItem}>
          <div className={classes.summaryLabel}>Visitors needed per group</div>
          <div className={classes.summaryValue}>{num(MIN_SESSIONS_FOR_WINNER)}</div>
        </div>
      </div>
      <p className={classes.verdict}>{verdictText(experiment, results)}</p>
    </>
  );
}
