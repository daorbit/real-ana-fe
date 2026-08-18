import { Button, Group, NumberInput, SegmentedControl, Text } from "@mantine/core";
import { CalendarClock } from "lucide-react";
import { FREQUENCIES, QUICK_TIMES, WEEKDAYS, describe, type Draft } from "./draft";
import type { PostFrequency } from "@/shared/types";

/**
 * The cadence controls: how often, which day, what time.
 *
 * Only the field the chosen frequency uses is shown — a day picker beside a
 * daily schedule is a control that does nothing. The sentence at the bottom is
 * the whole schedule read back, which is the one thing worth checking before
 * something publishes unattended.
 */
export function ScheduleFields({
  draft,
  onChange,
  timezone,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  timezone: string;
}) {
  return (
    <>
      <SegmentedControl
        fullWidth
        data={FREQUENCIES}
        value={draft.frequency}
        onChange={(v) => onChange({ frequency: v as PostFrequency })}
      />

      {draft.frequency === "weekly" && (
        <Group gap={6} mt="sm" wrap="wrap">
          {WEEKDAYS.map((d) => (
            <Button
              key={d.value}
              size="compact-sm"
              radius="xl"
              variant={String(draft.weekday) === d.value ? "filled" : "default"}
              onClick={() => onChange({ weekday: Number(d.value) })}
            >
              {d.label.slice(0, 3)}
            </Button>
          ))}
        </Group>
      )}

      {draft.frequency === "monthly" && (
        <NumberInput
          mt="sm"
          label="Day of month"
          description="1–28, so every month has the day."
          min={1}
          max={28}
          value={draft.dayOfMonth}
          onChange={(v) => onChange({ dayOfMonth: Number(v) || 1 })}
        />
      )}

      <Group mt="sm" gap="sm" align="flex-end" wrap="nowrap">
        <NumberInput
          label="Hour"
          min={0}
          max={23}
          w={90}
          value={draft.hour}
          onChange={(v) => onChange({ hour: Math.min(23, Math.max(0, Number(v) || 0)) })}
        />
        <NumberInput
          label="Minute"
          min={0}
          max={59}
          step={5}
          w={90}
          value={draft.minute}
          onChange={(v) => onChange({ minute: Math.min(59, Math.max(0, Number(v) || 0)) })}
        />
        <Group gap={6} wrap="nowrap" pb={2}>
          {QUICK_TIMES.map((q) => (
            <Button
              key={q.label}
              size="compact-sm"
              radius="xl"
              variant={draft.hour === q.hour && draft.minute === q.minute ? "filled" : "default"}
              onClick={() => onChange({ hour: q.hour, minute: q.minute })}
            >
              {q.label}
            </Button>
          ))}
        </Group>
      </Group>

      <Group gap={7} mt="sm" wrap="nowrap">
        <CalendarClock size={14} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
        <Text size="sm" c="dimmed">{describe(draft)} · {timezone}</Text>
      </Group>
    </>
  );
}
