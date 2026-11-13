import type { ReactNode } from "react";
import { InfoTip } from "@/shared/ui/InfoTip";
import classes from "./GrowthRadar.module.css";

export function SectionHeader({
  title,
  count,
  help,
  aside,
}: {
  title: string;
  count?: number;
  help?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={classes.sectionHead}>
      <span className={classes.sectionTitleRow}>
        <h2 className={classes.sectionTitle}>{title}</h2>
        {count !== undefined && <span className={classes.sectionCount}>{count}</span>}
        {help && <InfoTip label={help} size={14} />}
      </span>
      {aside}
    </div>
  );
}
