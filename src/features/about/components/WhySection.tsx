import type { ReactNode } from "react";
import classes from "./Why.module.css";

export function WhySection({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <h2 className={classes.sectionTitle}>{title}</h2>
        {lead && <p className={classes.sectionLead}>{lead}</p>}
      </div>
      {children}
    </section>
  );
}
