import type { ReactNode } from "react";
import classes from "./Workspaces.module.css";

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className={classes.stat}>
      <div className={classes.statLabel}>{label}</div>
      <div className={classes.statValue}>{value}</div>
      {hint && <div className={classes.statHint}>{hint}</div>}
    </div>
  );
}
