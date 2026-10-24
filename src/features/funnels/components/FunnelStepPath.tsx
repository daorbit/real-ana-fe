import { Fragment } from "react";
import { ChevronRight, FileText, Zap } from "lucide-react";
import type { FunnelStepInput } from "@/shared/types";
import classes from "./Funnels.module.css";

export function FunnelStepPath({ steps, compact = false }: { steps: FunnelStepInput[]; compact?: boolean }) {
  return (
    <ol className={classes.path} data-compact={compact || undefined} aria-label="Steps">
      {steps.map((step, i) => {
        const Icon = step.type === "event" ? Zap : FileText;
        return (
          <Fragment key={`${step.type}:${step.value}:${i}`}>
            {i > 0 && <ChevronRight size={compact ? 12 : 14} className={classes.pathSep} aria-hidden />}
            <li className={classes.pathStep}>
              {!compact && <span className={classes.pathNumber}>{i + 1}</span>}
              <Icon size={compact ? 12 : 13} className={classes.pathIcon} aria-label={step.type === "event" ? "Event" : "Page"} />
              <span className={classes.pathLabel}>{step.value}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
