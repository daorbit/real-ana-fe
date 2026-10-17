import type { CSSProperties } from "react";
import { TrendingDown } from "lucide-react";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";
import { stepLost } from "./funnelStats";
import classes from "./Funnel.module.css";

export function FunnelBarsView({ steps }: { steps: FunnelResultStep[] }) {
  return (
    <div className={classes.chartScroll}>
      <div className={classes.chart} style={{ "--steps": steps.length } as CSSProperties}>
        {steps.map((step, i) => (
          <div key={`${step.type}-${step.label}-${i}`} className={classes.col}>
            <span className={classes.colStep}>
              Step {i + 1} · {step.type === "page" ? "Page" : "Event"}
            </span>
            <span className={classes.colLabel} title={step.label}>{step.label}</span>
            <span className={classes.colCount}>{num(step.count)}</span>
            <span className={classes.colRate}>{step.rate}% of entered</span>
            <div className={classes.track}>
              <span className={classes.fill} style={{ "--rate": `${step.rate}%` } as CSSProperties} />
            </div>
            {i === 0 ? (
              <span className={classes.keep}>Starting point</span>
            ) : step.dropFromPrev > 0 ? (
              <span className={classes.drop}>
                <TrendingDown size={12} />
                {step.dropFromPrev}% · {num(stepLost(steps, i))} left
              </span>
            ) : (
              <span className={classes.keep}>Everyone continued</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
