import type { ReactNode } from "react";
import classes from "./SettingsList.module.css";

export function SettingsList({ children }: { children: ReactNode }) {
  return <div className={classes.list}>{children}</div>;
}

interface RowProps {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  alignTop?: boolean;
  children: ReactNode;
}

export function SettingsRow({ label, hint, required, alignTop, children }: RowProps) {
  return (
    <div className={classes.row} data-align={alignTop ? "start" : undefined}>
      <div className={classes.text}>
        <span className={classes.label}>
          {label}
          {required && <span className={classes.required}>Required</span>}
        </span>
        {hint && <span className={classes.hint}>{hint}</span>}
      </div>
      <div className={classes.control}>{children}</div>
    </div>
  );
}
