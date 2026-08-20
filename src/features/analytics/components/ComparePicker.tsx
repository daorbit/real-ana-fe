import { useState } from "react";
import { Button, Divider, Group, Popover, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { GitCompareArrows, Lock } from "lucide-react";
import dayjs from "dayjs";
import { useActiveBilling } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notify";
import type { CompareMode } from "@/shared/types";

export type CompareState = {
  /** Which baseline the deltas are measured against. */
  mode: CompareMode;
  /**
   * Where a custom baseline starts. Only meaningful when mode === "custom".
   *
   * There is deliberately no end date: the server takes the current window's
   * length, so a custom baseline is an anchor rather than a range. Letting the
   * user pick both ends would invite comparing seven days against thirty and
   * reading the resulting "-70%" as a traffic collapse.
   */
  from?: string;
};

const MODE_LABELS: Record<CompareMode, string> = {
  previous: "Previous period",
  yoy: "Year over year",
  custom: "Custom baseline",
};

/**
 * Picks the period the dashboard's deltas are measured against.
 *
 * Sits beside the range picker and follows the same rules: every baseline the
 * product has is rendered, ones outside the plan render locked and prompt an
 * upgrade rather than disappearing, and the server re-checks the choice
 * regardless of what this sends.
 */
export function ComparePicker({
  value,
  onChange,
  disabled,
}: {
  value: CompareState;
  onChange: (next: CompareState) => void;
  disabled?: boolean;
}) {
  const billing = useActiveBilling();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(
    value.from ? dayjs(value.from).format("YYYY-MM-DD") : null
  );

  // No billing yet (a loading gap, or a workspace with no plan row) allows
  // everything rather than locking someone out — same call the range picker
  // makes, and the server refuses the mode regardless.
  const allowed = billing?.compareModes;
  const isLocked = (mode: CompareMode) => Boolean(allowed && !allowed.includes(mode));

  const promptUpgrade = (mode: CompareMode) => {
    const planName = billing?.plan.name ?? "This workspace's";
    notify.quotaLimit(
      `${MODE_LABELS[mode]} comparison isn't included in the ${planName} plan. Upgrade this workspace to compare against any period.`
    );
  };

  const pick = (mode: CompareMode) => {
    if (isLocked(mode)) {
      promptUpgrade(mode);
      return;
    }
    if (mode === "custom") {
      setOpen(true);
      return;
    }
    onChange({ mode });
  };

  const apply = () => {
    if (!draft) return;
    onChange({ mode: "custom", from: dayjs(draft).startOf("day").toISOString() });
    setOpen(false);
  };

  /**
   * What the custom button says.
   *
   * "Custom" alone sat two controls away from the range picker's own Custom
   * button, so the row read as the same option twice. Unset it now names what
   * it picks — a baseline to compare against — and once set it shows the date,
   * which answers the question the label was standing in for.
   */
  const customLabel =
    value.mode === "custom" && value.from
      ? `vs ${dayjs(value.from).format("MMM D, YYYY")}`
      : "Custom baseline";

  return (
    <Group gap="xs" wrap="nowrap">
      {/* A rule between the two pickers. They are adjacent, similarly sized and
          both end in a button that opens a calendar — without a boundary the
          row reads as one control with five parts rather than "what am I
          looking at" beside "what am I measuring it against". */}
      <Divider orientation="vertical" my={6} />

      <Group gap={2} wrap="nowrap" className="range-segmented">
        {(["previous", "yoy"] as CompareMode[]).map((mode) => {
          const locked = isLocked(mode);
          const active = value.mode === mode;
          const btn = (
            <UnstyledButton
              key={mode}
              disabled={disabled}
              onClick={() => pick(mode)}
              className="range-seg-btn"
              data-active={active}
              data-locked={locked}
            >
              {locked && <Lock size={10} style={{ marginRight: 4 }} />}
              {mode === "previous" ? "Prev" : "YoY"}
            </UnstyledButton>
          );
          return locked ? (
            <Tooltip key={mode} label="Upgrade to unlock this comparison" withArrow>
              {btn}
            </Tooltip>
          ) : btn;
        })}
      </Group>

      <Popover opened={open} onChange={setOpen} position="bottom-end" shadow="md" radius="md" withArrow>
        <Tooltip
          label="Upgrade to unlock custom baselines"
          disabled={!isLocked("custom")}
          withArrow
        >
          <Popover.Target>
            <Button
              size="sm"
              variant={value.mode === "custom" ? "filled" : "default"}
              color={value.mode === "custom" ? "emerald" : undefined}
              leftSection={
                isLocked("custom") ? <Lock size={13} /> : <GitCompareArrows size={15} />
              }
              onClick={() => (isLocked("custom") ? promptUpgrade("custom") : setOpen((o) => !o))}
              disabled={disabled}
            >
              {customLabel}
            </Button>
          </Popover.Target>
        </Tooltip>
       
      
        <Popover.Dropdown>
          <Stack gap="sm" style={{ width: "fit-content" }}>
            <Text size="xs" fw={600} c="dimmed">
              Compare against the period starting
            </Text>
            <DatePicker
              value={draft}
              onChange={setDraft}
              maxDate={dayjs().format("YYYY-MM-DD")}
            />

            <Text size="xs" c="dimmed" lh={1.4} style={{ width: 0, minWidth: "100%" }}>
              Runs for the same length as the range you&apos;re viewing.
            </Text>
            <Group justify="flex-end" gap="xs">
              <Button size="xs" variant="subtle" color="gray" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="xs" color="emerald" onClick={apply} disabled={!draft}>
                Apply
              </Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
