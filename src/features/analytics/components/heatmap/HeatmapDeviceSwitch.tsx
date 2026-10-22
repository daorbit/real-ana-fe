import { Center, SegmentedControl } from "@mantine/core";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { HeatmapDevice } from "@/shared/types";

const OPTIONS = [
  { value: "desktop", icon: Monitor, label: "Desktop" },
  { value: "tablet", icon: Tablet, label: "Tablet" },
  { value: "mobile", icon: Smartphone, label: "Mobile" },
].map(({ value, icon: Icon, label }) => ({
  value,
  label: (
    <Center h={16}>
      <Icon size={14} aria-label={label} />
    </Center>
  ),
}));

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
