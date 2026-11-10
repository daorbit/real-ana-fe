import { Progress } from "@mantine/core";
import { num } from "@/shared/lib";
import classes from "@/shared/ui/WidgetMeter.module.css";

export function WidgetMeter({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className={classes.meter}>
      <span className={classes.label}>{label}</span>
      <Progress value={pct} size={6} radius="xl" color="var(--accent)" className={classes.bar} />
      <span className={classes.value}>{num(value)}</span>
    </div>
  );
}
