import { SegmentedControl } from "@mantine/core";
import type { HeatmapDevice } from "@/shared/types";

const OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

export function HeatmapDeviceSwitch({
  value,
  onChange,
}: {
  value: HeatmapDevice;
  onChange: (device: HeatmapDevice) => void;
}) {
  return (
    <SegmentedControl size="xs" value={value} onChange={(v) => onChange(v as HeatmapDevice)} data={OPTIONS} />
  );
}
