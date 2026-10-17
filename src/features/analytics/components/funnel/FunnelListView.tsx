import type { CSSProperties } from "react";
import { TrendingDown } from "lucide-react";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";
import classes from "./Funnel.module.css";

export function FunnelListView({ steps }: { steps: FunnelResultStep[] }) {
  return (
    <ol className={classes.list}>
      {steps.map((step, i) => (
        <li key={`${step.type}-${step.label}-${i}`} className={classes.listRow}>
          <span className={classes.marker}>{i + 1}</span>
          <span className={classes.listName}>
            <span className={classes.colLabel} title={step.label}>{step.label}</span>
            <span className={classes.colRate}>{step.type === "page" ? "Page" : "Event"} · {step.rate}% of entered</span>
          </span>
          <span className={classes.listBar}>
            <span className={classes.listFill} style={{ "--rate": `${step.rate}%` } as CSSProperties} />
          </span>
          <span className={classes.listNums}>
            {i > 0 && step.dropFromPrev > 0 && (
              <span className={classes.drop}>
                <TrendingDown size={12} />
                {step.dropFromPrev}%
              </span>
            )}
            <span className={classes.listCount}>{num(step.count)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
