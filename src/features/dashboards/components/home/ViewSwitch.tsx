import { SegmentedControl } from "@mantine/core";
import classes from "@/features/dashboards/components/home/Home.module.css";

export type DashboardsView = "dashboards" | "embeds";

export function ViewSwitch({
  value,
  dashboards,
  embeds,
  onChange,
}: {
  value: DashboardsView;
  dashboards: number;
  embeds: number;
  onChange: (view: DashboardsView) => void;
}) {
  const option = (view: DashboardsView, label: string, count: number) => ({
    value: view,
    label: (
      <span className={classes.switchText}>
        {label}
        <span className={classes.switchCount}>{count}</span>
      </span>
    ),
  });

  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as DashboardsView)}
      data={[option("dashboards", "Dashboards", dashboards), option("embeds", "Embedded widgets", embeds)]}
      classNames={{ root: classes.switchRoot, label: classes.switchLabel }}
    />
  );
}
