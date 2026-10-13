import classes from "./SecurityGroup.module.css";

export function StatusBadge({ on, onLabel = "On", offLabel = "Off" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className={classes.status} data-on={on || undefined}>
      {on ? onLabel : offLabel}
    </span>
  );
}
