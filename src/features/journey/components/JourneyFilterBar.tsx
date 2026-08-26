import { Group, TextInput, MultiSelect, Switch, Button, Badge } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Search, X } from "lucide-react";
import type { JourneyFilters } from "@/features/journey/lib/deriveJourney";
import { EMPTY_FILTERS } from "@/features/journey/lib/deriveJourney";

/**
 * The controls every journey view reads from.
 *
 * One bar above the view switcher rather than per-view controls: the filters
 * mean the same thing in all four readings, and a filter that resets when you
 * switch from the graph to the list would make comparing them useless.
 */
export function JourneyFilterBar({
  filters,
  onChange,
  options,
  total,
  showing,
}: {
  filters: JourneyFilters;
  onChange: (next: JourneyFilters) => void;
  /** Every distinct action in the raw feed, most frequent first. */
  options: { value: string; count: number }[];
  total: number;
  showing: number;
}) {
  const set = <K extends keyof JourneyFilters>(key: K, value: JourneyFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const dirty =
    filters.actions.length > 0 ||
    filters.search !== "" ||
    filters.from !== null ||
    filters.to !== null ||
    filters.collapseRepeats;

  return (
    <Group gap="sm" wrap="wrap" align="flex-end">
      <TextInput
        placeholder="Search steps"
        leftSection={<Search size={15} />}
        value={filters.search}
        onChange={(e) => set("search", e.currentTarget.value)}
        w={200}
      />

      <MultiSelect
        placeholder={filters.actions.length ? undefined : "All actions"}
        data={options.map((o) => ({ value: o.value, label: `${o.value} (${o.count})` }))}
        value={filters.actions}
        onChange={(v) => set("actions", v)}
        searchable
        clearable
        maxDropdownHeight={280}
        w={240}
      />

      <DatePickerInput
        type="range"
        placeholder="All time"
        value={[
          filters.from ? new Date(filters.from) : null,
          filters.to ? new Date(filters.to) : null,
        ]}
        onChange={([from, to]) => {
          onChange({
            ...filters,
            from: from ? new Date(from).toISOString() : null,
            to: to ? new Date(to).toISOString() : null,
          });
        }}
        clearable
        w={220}
      />

      <Switch
        checked={filters.collapseRepeats}
        onChange={(e) => set("collapseRepeats", e.currentTarget.checked)}
        color="emerald"
        label="Collapse repeats"
        mb={6}
      />

      {dirty && (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<X size={14} />}
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Clear
        </Button>
      )}

      {/* Kept honest about what's hidden: a filtered view that doesn't say so
          is how someone concludes a user did four things when they did forty. */}
      <Badge variant="light" color={showing < total ? "amber" : "gray"} radius="sm" mb={6}>
        {showing === total ? `${total} steps` : `${showing} of ${total} steps`}
      </Badge>
    </Group>
  );
}
