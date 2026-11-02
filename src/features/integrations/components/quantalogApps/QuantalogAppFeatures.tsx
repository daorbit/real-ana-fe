import { Eye, Layers, ShieldCheck } from "lucide-react";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import classes from "./QuantalogApp.module.css";

const FEATURE_ICONS = [Layers, ShieldCheck, Eye];

export function QuantalogAppFeatures({ info }: { info: WorkspaceAppInfo }) {
  return (
    <ul className={classes.featureList}>
      {info.features.map((feature, index) => {
        const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
        return (
          <li key={feature.title} className={classes.featureCard}>
            <span className={classes.featureIcon} aria-hidden>
              <Icon size={16} />
            </span>
            <span className={classes.featureTitle}>{feature.title}</span>
            <span className={classes.featureBody}>{feature.body}</span>
          </li>
        );
      })}
    </ul>
  );
}
