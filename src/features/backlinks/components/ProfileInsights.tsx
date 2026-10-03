import { AlertTriangle, CircleCheck, Info } from "lucide-react";
import type { ProfileInsight } from "../types";
import classes from "./Backlinks.module.css";

const ICONS = { strength: CircleCheck, risk: AlertTriangle, neutral: Info } as const;

export function ProfileInsights({ insights }: { insights: ProfileInsight[] }) {
  return (
    <div className={classes.insights}>
      {insights.map((i) => {
        const Icon = ICONS[i.tone];
        return (
          <div key={i.id} className={classes.insight} data-tone={i.tone}>
            <Icon size={16} className={classes.insightIcon} />
            <div>
              <div className={classes.insightTitle}>{i.title}</div>
              <div className={classes.insightDetail}>{i.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
