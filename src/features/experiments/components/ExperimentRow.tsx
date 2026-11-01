import { Link } from "react-router-dom";
import { shortDate } from "@/shared/lib/format";
import { TYPE_LABEL } from "@/features/experiments/lib/experimentLabels";
import type { Experiment } from "@/features/experiments/types";
import { ExperimentStatusBadge } from "./ExperimentStatusBadge";
import classes from "./Experiments.module.css";

function goalText(experiment: Experiment): string {
  return experiment.goal.type === "page" ? `visits ${experiment.goal.value}` : `triggers ${experiment.goal.value}`;
}

export function ExperimentRow({ experiment, siteName }: { experiment: Experiment; siteName: string }) {
  const when = experiment.startedAt ? `Started ${shortDate(experiment.startedAt)}` : `Created ${shortDate(experiment.createdAt)}`;
  return (
    <Link to={`/app/experiments/${experiment.id}`} className={classes.row}>
      <div>
        <div className={classes.rowName}>{experiment.name}</div>
        <div className={classes.rowMeta}>
          {TYPE_LABEL[experiment.type]} · {siteName} · goal: {goalText(experiment)}
        </div>
      </div>
      <div className={classes.rowSide}>
        <span>{when}</span>
        <ExperimentStatusBadge status={experiment.status} />
      </div>
    </Link>
  );
}
