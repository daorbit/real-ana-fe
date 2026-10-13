import type { ReactNode } from "react";
import classes from "./Sidebar.module.css";

export function SidebarCard({
  title,
  description,
  action,
  footer,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.panel}>
      <header className={classes.panelHead}>
        <div className={classes.panelHeadText}>
          <h3 className={classes.panelTitle}>{title}</h3>
          {description && <p className={classes.panelDesc}>{description}</p>}
        </div>
        {action}
      </header>
      <div className={classes.panelBody}>{children}</div>
      {footer && <footer className={classes.panelFoot}>{footer}</footer>}
    </section>
  );
}
