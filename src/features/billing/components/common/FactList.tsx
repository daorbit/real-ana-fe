import type { ComponentType } from "react";
import classes from "./BillingCommon.module.css";

export type Fact = {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
};

export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <div className={classes.facts}>
      {facts.map(({ icon: Icon, title, text }) => (
        <div key={title} className={classes.fact}>
          <span className={classes.factIcon}>
            <Icon size={16} />
          </span>
          <div>
            <p className={classes.factTitle}>{title}</p>
            <p className={classes.factText}>{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
