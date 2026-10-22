import { Check } from "lucide-react";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import classes from "./QuantalogApp.module.css";

export function QuantalogAppFeatures({ info }: { info: WorkspaceAppInfo }) {
  return (
    <ul className={classes.featureList}>
      {info.features.map((feature) => (
        <li key={feature.title} className={classes.featureRow}>
          <span className={classes.featureCheck} aria-hidden>
            <Check size={18} strokeWidth={2.2} />
          </span>
          <span className={classes.featureText}>
            <span className={classes.featureTitle}>{feature.title}</span>
            <span className={classes.featureBody}>{feature.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
