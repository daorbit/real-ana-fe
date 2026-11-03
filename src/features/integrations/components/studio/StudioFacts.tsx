import type { ReactNode } from "react";
import classes from "./StudioFacts.module.css";

export interface StudioFact {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: "on" | "warn";
}

export function StudioFacts({ facts }: { facts: StudioFact[] }) {
  return (
    <section aria-label="At a glance" className={classes.facts}>
      {facts.map((fact) => (
        <div key={fact.label} className={classes.fact}>
          <span className={classes.label}>{fact.label}</span>
          <span className={classes.value} data-tone={fact.tone}>
            {fact.tone && <span className={classes.dot} aria-hidden />}
            {fact.value}
          </span>
          {fact.note && <span className={classes.note}>{fact.note}</span>}
        </div>
      ))}
    </section>
  );
}
