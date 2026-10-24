import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";
import { durationLabel, percentLabel, relativeChange } from "../lib/funnelFormat";
import classes from "./FunnelResults.module.css";

export function FunnelTable({
  steps,
  worstIndex,
  comparing,
}: {
  steps: FunnelResultStep[];
  worstIndex: number | null;
  comparing: boolean;
}) {
  return (
    <div className={classes.tableWrap}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">Sessions</th>
            <th scope="col">Of first step</th>
            <th scope="col">Of previous</th>
            <th scope="col">Dropped</th>
            <th scope="col">Avg. time from previous</th>
            {comparing && <th scope="col">vs previous period</th>}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => {
            const change = comparing ? relativeChange(step.count, step.previousCount) : null;
            const worst = worstIndex === i;
            return (
              <tr key={`${step.type}:${step.label}:${i}`} data-worst={worst || undefined}>
                <th scope="row">
                  <span className={classes.rowStep}>
                    <span className={classes.rowNumber}>{i + 1}</span>
                    <span className={classes.rowLabel} title={step.label}>
                      {step.label}
                    </span>
                    {worst && <span className={classes.leakTag}>Biggest leak</span>}
                  </span>
                </th>
                <td className={classes.strong}>{num(step.count)}</td>
                <td>{percentLabel(step.rate)}</td>
                <td>{i === 0 ? "—" : percentLabel(step.stepRate)}</td>
                <td data-tone={worst ? "loss" : undefined}>{i === 0 ? "—" : num(step.dropped)}</td>
                <td>{durationLabel(step.avgSecondsFromPrev)}</td>
                {comparing && (
                  <td className={classes.strong} data-tone={change?.tone}>
                    {change?.label ?? "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
