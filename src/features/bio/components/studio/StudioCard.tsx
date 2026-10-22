import type { ReactNode } from "react";
import classes from "./BioStudio.module.css";

export function StudioCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <h3 className={classes.cardTitle}>{title}</h3>
        <p className={classes.cardText}>{description}</p>
      </header>
      <div className={classes.cardBody}>{children}</div>
    </section>
  );
}
