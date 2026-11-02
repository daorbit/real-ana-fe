import type { Tone } from "./tone";
import classes from "./seoUi.module.css";

export type Fact = { label: string; value: string; tone?: Tone };

export function FactStrip({ facts }: { facts: Fact[] }) {
  return (
    <div className={classes.facts}>
      {facts.map((f) => (
        <div key={f.label} className={classes.fact} data-tone={f.tone}>
          <span className={classes.factLabel}>{f.label}</span>
          <span className={classes.factValue} title={f.value}>
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}
