import type { ReactNode } from "react";
import classes from "./Sidebar.module.css";

export function InsetSection({
  title,
  footer,
  action,
  children,
}: {
  title: string;
  footer?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <header className={classes.sectionHead}>
        <h3 className={classes.sectionTitle}>{title}</h3>
        {action}
      </header>
      <div className={classes.card}>{children}</div>
      {footer && <p className={classes.sectionFoot}>{footer}</p>}
    </section>
  );
}
