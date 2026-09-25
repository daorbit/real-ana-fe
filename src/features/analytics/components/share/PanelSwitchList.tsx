import { Switch } from "@mantine/core";
import classes from "./Share.module.css";

export interface PanelOption<K extends string> {
  key: K;
  label: string;
  hint: string;
}

export interface PanelGroup<K extends string> {
  heading: string;
  note?: string;
  panels: PanelOption<K>[];
}

interface Props<K extends string> {
  groups: PanelGroup<K>[];
  values: Record<K, boolean>;
  onToggle: (key: K, next: boolean) => void;
}

/** Grouped on/off rows for the panels a public page may show. */
export function PanelSwitchList<K extends string>({ groups, values, onToggle }: Props<K>) {
  return (
    <div className={classes.groups}>
      {groups.map((g) => (
        <section key={g.heading} className={classes.group}>
          <div className={classes.groupHead}>
            <span className={classes.groupTitle}>{g.heading}</span>
            {g.note && <span className={classes.groupNote}>{g.note}</span>}
          </div>
          <div className={classes.card}>
            {g.panels.map((p) => (
              <label key={p.key} className={classes.switchRow}>
                <span className={classes.switchText}>
                  <span className={classes.switchLabel}>{p.label}</span>
                  <span className={classes.switchHint}>{p.hint}</span>
                </span>
                <Switch
                  size="sm"
                  checked={values[p.key]}
                  onChange={(e) => onToggle(p.key, e.currentTarget.checked)}
                  aria-label={p.label}
                />
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
