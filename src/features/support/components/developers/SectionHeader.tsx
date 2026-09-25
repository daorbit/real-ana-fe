import type { ReactNode } from "react";
import classes from "./Developers.module.css";

interface Props {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: Props) {
  return (
    <div className={classes.sectionHead}>
      <div className={classes.sectionIntro}>
        {title && <h2 className={classes.sectionTitle}>{title}</h2>}
        {description && <p className={classes.sectionDesc}>{description}</p>}
      </div>
      {action && <div className={classes.sectionAction}>{action}</div>}
    </div>
  );
}
