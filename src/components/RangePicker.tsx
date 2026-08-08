import { useState } from "react";
import { Button, Group, Popover, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { CalendarDays, Lock } from "lucide-react";
import dayjs from "dayjs";
import { useActiveBilling } from "../workspace";
import { notify } from "../notify";

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
 *
 * Ranges outside the account's plan (Free is 1h/24h only) render locked —
 * clicking one opens an upgrade prompt instead of switching, so the picker
 * still shows every range that exists rather than hiding what a paid plan
 * would unlock.
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
  const billing = useActiveBilling();
  const [open, setOpen] = useState(false);
  // Local calendar selection, only pushed up on Apply. Mantine v9 dates are
  // "YYYY-MM-DD" strings, not Date objects.
  const [draft, setDraft] = useState<[string | null, string | null]>([
    value.from ? dayjs(value.from).format("YYYY-MM-DD") : null,
    value.to ? dayjs(value.to).format("YYYY-MM-DD") : null,
  ]);

  // The active workspace's plan decides this — ranges are entitled per
  // workspace. No billing yet (a loading gap, or a workspace with no plan row)
  // defaults to allowing everything rather than locking someone out; the
  // server refuses the range regardless.
  const allowed = billing?.allowedRanges;
  const isLocked = (range: string) => Boolean(allowed && !allowed.includes(range as never));

  const isCustom = value.preset === "custom";
  const customLabel =
    isCustom && value.from && value.to
      ? `${dayjs(value.from).format("MMM D")} – ${dayjs(value.to).format("MMM D")}`
      : "Custom";
  const customLocked = isLocked("custom");

  const promptUpgrade = () => {
    const planName = billing?.plan.name ?? "This workspace's";
    notify.quotaLimit(
      `${planName} plan only includes 1h and 24h ranges. Upgrade this workspace to unlock 7d, 30d, and custom date ranges.`
    );
  };

  const pick = (range: string) => {
    if (isLocked(range)) {
      promptUpgrade();
      return;
    }
    onChange({ preset: range });
  };

  const apply = () => {
    if (customLocked) {
      setOpen(false);
      promptUpgrade();
      return;
    }
    const [f, t] = draft;
    if (!f || !t) return;
    // Cover whole days: start at 00:00 of the first, end at 23:59:59 of the last.
    const from = dayjs(f).startOf("day").toISOString();
    const to = dayjs(t).endOf("day").toISOString();
    onChange({ preset: "custom", from, to });
    setOpen(false);
  };

  return (
    <>
      <Group gap="xs" wrap="nowrap">
        {/* A plain SegmentedControl can't grey out one option while keeping
            the others clickable, so this is hand-rolled from buttons. */}
        <Group gap={2} wrap="nowrap" className="range-segmented">
          {RANGE_PRESETS.map((r) => {
            const locked = isLocked(r.value);
            const active = !isCustom && value.preset === r.value;
            const btn = (
              <UnstyledButton
                key={r.value}
                disabled={disabled}
                onClick={() => pick(r.value)}
                className="range-seg-btn"
                data-active={active}
                data-locked={locked}
              >
                {locked && <Lock size={10} style={{ marginRight: 4 }} />}
                {r.label}
              </UnstyledButton>
            );
            return locked ? (
              <Tooltip key={r.value} label="Upgrade to unlock this range" withArrow>
                {btn}
              </Tooltip>
            ) : btn;
          })}
        </Group>

        <Popover opened={open} onChange={setOpen} position="bottom-end" shadow="md" radius="md" withArrow>
  
          <Tooltip
            label="Upgrade to unlock custom ranges"
            disabled={!customLocked}
            withArrow
          >
            <Popover.Target>
              <Button
                size="sm"
                variant={isCustom ? "filled" : "default"}
                color={isCustom ? "emerald" : undefined}
                leftSection={customLocked ? <Lock size={13} /> : <CalendarDays size={15} />}
                onClick={() => (customLocked ? promptUpgrade() : setOpen((o) => !o))}
                disabled={disabled}
              >
                {customLabel}
              </Button>
            </Popover.Target>
          </Tooltip>
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
    </>
  );
}
