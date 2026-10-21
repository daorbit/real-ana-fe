import type { ReactNode } from "react";
import classes from "./Share.module.css";

export function SectionHead({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className={classes.sectionHead}>
      <div className={classes.sectionIntro}>
        <h2 className={classes.sectionTitle}>{title}</h2>
        {description && <p className={classes.sectionDesc}>{description}</p>}
      </div>
      {actions && <div className={classes.sectionActions}>{actions}</div>}
    </div>
  );
}
