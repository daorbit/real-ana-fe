import { Check } from "lucide-react";
import type { AuthorizationRequest } from "@/features/connectors/lib/connectorApi";
import classes from "./WorkspacePicker.module.css";

type Workspace = AuthorizationRequest["workspaces"][number];

interface Props {
  workspaces: Workspace[];
  value: string | null;
  disabled?: boolean;
  onChange: (id: string) => void;
}

export function WorkspacePicker({ workspaces, value, disabled, onChange }: Props) {
  return (
    <div className={classes.group} role="radiogroup" aria-label="Workspace to connect">
      {workspaces.map((w) => {
        const selected = w.id === value;
        return (
          <button
            key={w.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={classes.option}
            data-selected={selected || undefined}
            onClick={() => onChange(w.id)}
          >
            <span className={classes.avatar} aria-hidden>
              {w.name.trim().charAt(0).toUpperCase() || "W"}
            </span>
            <span className={classes.text}>
              <span className={classes.name}>{w.name}</span>
              <span className={classes.role}>{w.role}</span>
            </span>
            <span className={classes.radio} aria-hidden>
              {selected && <Check size={13} strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
