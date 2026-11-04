import type { ReactNode } from "react";
import classes from "./Branding.module.css";

export function BrandingGroup({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.group}>
      <div className={classes.groupHead}>
        <div>
          <h2 className={classes.groupTitle}>{title}</h2>
          {description && <p className={classes.groupText}>{description}</p>}
        </div>
        {actions}
      </div>
      <div className={classes.groupCard}>{children}</div>
    </section>
  );
}

export function BrandingRow({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className={classes.row}>
      <div className={classes.rowText}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={classes.rowLabel}>{label}</label>
        ) : (
          <div className={classes.rowLabel}>{label}</div>
        )}
        <div className={classes.rowHint}>{hint}</div>
      </div>
      <div className={classes.rowControl}>{children}</div>
    </div>
  );
}
