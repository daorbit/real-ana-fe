import type { ReactNode } from "react";
import { InfoTip } from "@/shared/ui/InfoTip";
import classes from "../Opportunity.module.css";

export function Panel({
  id,
  title,
  help,
  aside,
  children,
}: {
  id: string;
  title: ReactNode;
  help?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.panel} aria-labelledby={id}>
      <div className={classes.panelHead}>
        <h2 id={id} className={classes.panelTitle}>
          {title}
        </h2>
        {help && <InfoTip label={help} />}
        {aside && <span className={classes.panelAside}>{aside}</span>}
      </div>
      {children}
    </section>
  );
}
