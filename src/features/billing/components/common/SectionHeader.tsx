import type { ReactNode } from "react";
import classes from "./BillingCommon.module.css";

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={classes.header}>
      <div>
        <h3 className={classes.title}>{title}</h3>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {actions && <div className={classes.actions}>{actions}</div>}
    </header>
  );
}
