import { Switch } from "@mantine/core";
import { RangePicker, type RangeState } from "@/features/analytics/components/RangePicker";
import classes from "./Funnels.module.css";

export function FunnelRangeControls({
  range,
  onRangeChange,
  compare,
  onCompareChange,
}: {
  range: RangeState;
  onRangeChange: (range: RangeState) => void;
  compare: boolean;
  onCompareChange: (on: boolean) => void;
}) {
  return (
    <div className={classes.rangeControls}>
      <RangePicker value={range} onChange={onRangeChange} />
      <Switch
        className={classes.compareSwitch}
        checked={compare}
        onChange={(e) => onCompareChange(e.currentTarget.checked)}
        label="Compare to previous period"
      />
    </div>
  );
}
