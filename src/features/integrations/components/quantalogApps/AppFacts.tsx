import classes from "./QuantalogApp.module.css";

export interface AppFact {
  label: string;
  value: string;
  note: string;
  tone?: "on";
}

export function AppFacts({ facts }: { facts: AppFact[] }) {
  return (
    <section aria-label="At a glance" className={classes.facts}>
      {facts.map((fact) => (
        <div key={fact.label} className={classes.fact}>
          <span className={classes.factLabel}>{fact.label}</span>
          <span className={classes.factValue} data-tone={fact.tone}>
            {fact.tone === "on" && <span className={classes.factDot} aria-hidden />}
            {fact.value}
          </span>
          <span className={classes.factNote}>{fact.note}</span>
        </div>
      ))}
    </section>
  );
}
