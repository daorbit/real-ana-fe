import { useState } from "react";
import { Button, Group, Popover, SegmentedControl, Stack, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { CalendarDays } from "lucide-react";
import dayjs from "dayjs";

/** The preset windows, matching the backend's RANGES keys. */
export const RANGE_PRESETS = [
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

export type RangeState = {
  /** A preset key, or "custom" when from/to are set. */
  preset: string;
  /** ISO datetime bounds, only meaningful when preset === "custom". */
  from?: string;
  to?: string;
};

/**
 * Range control: preset buttons plus a Custom option that opens a from–to
 * calendar. Custom is only committed when both ends are chosen, so a
 * half-picked range never fires a request.
 */
export function RangePicker({
  value,
  onChange,
  disabled,
}: {
  value: RangeState;
  onChange: (next: RangeState) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // Local calendar selection, only pushed up on Apply. Mantine v9 dates are
  // "YYYY-MM-DD" strings, not Date objects.
  const [draft, setDraft] = useState<[string | null, string | null]>([
    value.from ? dayjs(value.from).format("YYYY-MM-DD") : null,
    value.to ? dayjs(value.to).format("YYYY-MM-DD") : null,
  ]);

  const isCustom = value.preset === "custom";
  const customLabel =
    isCustom && value.from && value.to
      ? `${dayjs(value.from).format("MMM D")} – ${dayjs(value.to).format("MMM D")}`
      : "Custom";

  const apply = () => {
    const [f, t] = draft;
    if (!f || !t) return;
    // Cover whole days: start at 00:00 of the first, end at 23:59:59 of the last.
    const from = dayjs(f).startOf("day").toISOString();
    const to = dayjs(t).endOf("day").toISOString();
    onChange({ preset: "custom", from, to });
    setOpen(false);
  };

  return (
    <Group gap="xs" wrap="nowrap">
      <SegmentedControl
        size="sm"
        value={isCustom ? "" : value.preset}
        onChange={(v) => v && onChange({ preset: v })}
        data={RANGE_PRESETS}
        disabled={disabled}
      />

      <Popover opened={open} onChange={setOpen} position="bottom-end" shadow="md" radius="md" withArrow>
        <Popover.Target>
          <Button
            size="sm"
            variant={isCustom ? "filled" : "default"}
            color={isCustom ? "emerald" : undefined}
            leftSection={<CalendarDays size={15} />}
            onClick={() => setOpen((o) => !o)}
            disabled={disabled}
          >
            {customLabel}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Text size="xs" fw={600} c="dimmed">Pick a start and end date</Text>
            <DatePicker
              type="range"
              value={draft}
              onChange={setDraft}
              maxDate={dayjs().format("YYYY-MM-DD")}
              allowSingleDateInRange
            />
            <Group justify="flex-end" gap="xs">
              <Button size="xs" variant="subtle" color="gray" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                color="emerald"
                onClick={apply}
                disabled={!draft[0] || !draft[1]}
              >
                Apply
              </Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
