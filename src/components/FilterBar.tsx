import { Group, Badge, Text, Button } from "@mantine/core";
import { Filter, X } from "lucide-react";
import type { StatsFilter } from "../types";

/** Human labels for each filterable dimension. */
const LABELS: Record<keyof StatsFilter, string> = {
  country: "Country",
  device: "Device",
  browser: "Browser",
  os: "OS",
  referrer: "Referrer",
  path: "Page",
  language: "Language",
  utmSource: "UTM source",
  utmCampaign: "UTM campaign",
  eventName: "Event",
};

/**
 * The strip of active filters above the dashboard. Each chip shows one
 * dimension being filtered and removes itself on click; "Clear all" resets the
 * whole segment. Renders nothing when no filter is set.
 */
export function FilterBar({
  filter,
  onRemove,
  onClear,
}: {
  filter: StatsFilter;
  onRemove: (key: keyof StatsFilter) => void;
  onClear: () => void;
}) {
  const entries = Object.entries(filter).filter(([, v]) => v) as [
    keyof StatsFilter,
    string,
  ][];

  if (entries.length === 0) return null;

  return (
    <Group gap="xs" mb="lg" wrap="wrap">
      <Group gap={6} wrap="nowrap">
        <Filter size={14} className="sect-ic" />
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          Filtered by
        </Text>
      </Group>

      {entries.map(([key, value]) => (
        <Badge
          key={key}
          variant="light"
          color="emerald"
          size="lg"
          radius="sm"
          style={{ cursor: "pointer", textTransform: "none" }}
          rightSection={<X size={12} style={{ display: "block" }} />}
          onClick={() => onRemove(key)}
          title="Remove filter"
        >
          {LABELS[key]}: <b>{value}</b>
        </Badge>
      ))}

      <Button variant="subtle" color="gray" size="compact-xs" onClick={onClear}>
        Clear all
      </Button>
    </Group>
  );
}
