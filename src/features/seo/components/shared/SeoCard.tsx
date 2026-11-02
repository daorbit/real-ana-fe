import type { ReactNode } from "react";
import classes from "./seoUi.module.css";

export function SeoCard({
  title,
  description,
  right,
  flush = false,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${classes.card} ${className ?? ""}`} data-flush={flush || undefined}>
      {(title || right) && (
        <header className={classes.cardHead}>
          <div className={classes.cardHeadText}>
            {title && <h3 className={classes.cardTitle}>{title}</h3>}
            {description && <p className={classes.cardDesc}>{description}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function SeoSection({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <header className={classes.sectionHead}>
        <div>
          <h2 className={classes.sectionTitle}>{title}</h2>
          {description && <p className={classes.sectionDesc}>{description}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}
