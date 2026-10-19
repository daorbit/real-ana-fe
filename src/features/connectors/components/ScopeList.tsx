import { Check } from "lucide-react";
import type { ConnectorScope } from "@/features/connectors/lib/connectorApi";
import classes from "./ScopeList.module.css";

export function ScopeList({ scopes }: { scopes: ConnectorScope[] }) {
  return (
    <ul className={classes.list}>
      {scopes.map((s) => (
        <li key={s.scope} className={classes.item}>
          <span className={classes.tick}>
            <Check size={13} strokeWidth={2.6} />
          </span>
          <span>{s.description}</span>
        </li>
      ))}
    </ul>
  );
}
