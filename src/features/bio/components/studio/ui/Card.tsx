import type { ReactNode } from "react";
import classes from "./Card.module.css";

export function Card({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <div className={classes.card} data-padded={padded || undefined}>
      {children}
    </div>
  );
}

export function CardSection({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <section className={classes.section}>
      <header className={classes.head}>
        <h3 className={classes.title}>{title}</h3>
        {meta && <span className={classes.meta}>{meta}</span>}
      </header>
      {children}
    </section>
  );
}
