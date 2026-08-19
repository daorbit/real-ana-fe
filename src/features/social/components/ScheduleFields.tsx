import { Box, Button, Divider, Group, NumberInput, SegmentedControl, Text } from "@mantine/core";
import { DatePickerInput, TimePicker } from "@mantine/dates";
import { CalendarClock, TriangleAlert } from "lucide-react";
import {
  FREQUENCIES, QUICK_TIMES, WEEKDAYS, describe, toDateInput, type Draft,
} from "./draft";
import type { PostFrequency, PostMode } from "@/shared/types";

/**
 * When the post goes out.
 *
 * Two modes, and the default is the one people actually want: a single post at
 * a date and time they pick. Every scheduling tool works this way because a
 * queue of distinct posts is what a content calendar is — the same words
 * republished on a cadence reads as spam, and LinkedIn deprioritises duplicate
 * commentary.
 *
 * Repeating is kept for genuinely evergreen content, behind the second tab and
 * under a warning that says what it will do.
 */

/** Nothing can be scheduled into the past, so the picker starts today. */
const TODAY = toDateInput(new Date());

/** Relative jumps, which is how people actually pick a near date. */
const QUICK_DAYS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In a week", days: 7 },
];

function dateIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

/** Groups the cadence controls so they read as one setting, not loose rows. */
const PANEL = {
  background: "var(--mantine-color-default)",
  border: "1px solid var(--mantine-color-default-border)",
  borderRadius: "var(--mantine-radius-md)",
};

/** A labelled row inside the cadence panel. */
function SubField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="schedule-subfield">
      <Group gap={6} align="baseline" mb={8} wrap="nowrap">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.04em" }}>
          {label}
        </Text>
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
      </Group>
      {children}
    </Box>
  );
}

export function ScheduleFields({
  draft,
  onChange,
  timezone,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  timezone: string;
}) {
  const past = draft.mode === "once" && new Date(`${draft.date}T${draft.time}`).getTime() < Date.now();

  return (
    <>
      <SegmentedControl
        fullWidth
        data={[
          { value: "once", label: "Post once" },
          { value: "repeat", label: "Repeat" },
        ]}
        value={draft.mode}
        onChange={(v) => onChange({ mode: v as PostMode })}
      />

      {draft.mode === "once" ? (
        <>
          {/* Mantine's own pickers rather than `type="date"`/`type="time"`: the
              native widgets are drawn by the browser, so they ignore the app's
              theme entirely and render a light popover over a dark page. Both
              still speak the same "YYYY-MM-DD" / "HH:mm" strings the draft
              stores, so nothing downstream changes. */}
          <Group mt="md" gap="sm" align="flex-end" wrap="nowrap">
            <DatePickerInput
              label="Date"
              placeholder="Pick a date"
              minDate={TODAY}
              valueFormat="ddd, D MMM YYYY"
              value={draft.date || null}
              onChange={(value) => onChange({ date: value ?? "" })}
              style={{ flex: 1 }}
            />
            <TimePicker
              label="Time"
              format="12h"
              withDropdown
              value={draft.time}
              onChange={(value) => onChange({ time: value })}
              w={150}
            />
          </Group>

          {/* `rowGap` as well as `gap`: these wrap onto a second line on a
              narrow composer, and without it the rows sit flush against each
              other while the columns are spaced. */}
          <Group gap={8} mt="md" wrap="wrap" style={{ rowGap: 8 }}>
            {QUICK_DAYS.map((q) => {
              const value = dateIn(q.days);
              return (
                <Button
                  key={q.label}
                  size="compact-sm"
                  radius="xl"
                  variant={draft.date === value ? "filled" : "default"}
                  onClick={() => onChange({ date: value })}
                >
                  {q.label}
                </Button>
              );
            })}
            {QUICK_TIMES.map((q) => {
              const value = `${String(q.hour).padStart(2, "0")}:${String(q.minute).padStart(2, "0")}`;
              return (
                <Button
                  key={q.label}
                  size="compact-sm"
                  radius="xl"
                  variant={draft.time === value ? "filled" : "default"}
                  onClick={() => onChange({ time: value })}
                >
                  {q.label}
                </Button>
              );
            })}
          </Group>

          {past && (
            <Text size="xs" c="orange" mt={8}>
              That time has already passed. Pick a later one.
            </Text>
          )}
        </>
      ) : (
        <>
          {/* Said before it is saved, not discovered afterwards: this publishes
              identical text on every run, which is the one thing a reader of
              someone's feed notices immediately. */}
          {/* A caution, not a failure: quiet enough that it does not dominate
              the panel it introduces, explicit enough that nobody meets the
              behaviour for the first time in their own feed. */}
          <Group gap={8} mt="sm" align="flex-start" wrap="nowrap">
            <TriangleAlert
              size={14}
              style={{ color: "var(--mantine-color-orange-5)", flexShrink: 0, marginTop: 2 }}
            />
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
              Publishes <strong>the same text and image every time</strong>. Evergreen content
              only — LinkedIn deprioritises duplicates. For a content calendar, schedule
              separate posts.
            </Text>
          </Group>

          <SegmentedControl
            fullWidth
            mt="md"
            data={FREQUENCIES}
            value={draft.frequency}
            onChange={(v) => onChange({ frequency: v as PostFrequency })}
          />

          {/* Cadence detail and time-of-day are one decision — "which Wednesday,
              and when" — so they share a panel instead of stacking as loose rows
              at the same rhythm as everything above them. */}
          <Box mt="sm" p="md" style={PANEL}>
            {draft.frequency === "weekly" && (
              <SubField label="Repeat on">
                <Group gap={8} wrap="wrap" style={{ rowGap: 8 }}>
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
              </SubField>
            )}

            {draft.frequency === "monthly" && (
              <SubField label="Day of month" hint="1–28, so every month has the day">
                <NumberInput
                  min={1}
                  max={28}
                  w={110}
                  value={draft.dayOfMonth}
                  onChange={(v) => onChange({ dayOfMonth: Number(v) || 1 })}
                />
              </SubField>
            )}

            {/* The presets are the fast path and the spinners are the escape
                hatch, so the presets lead and the exact fields sit behind a
                divider rather than competing with them side by side. */}
            <SubField label="Time of day">
              <Group gap={8} wrap="wrap" style={{ rowGap: 8 }}>
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
                <Divider orientation="vertical" mx={4} my={2} />
                <Group gap={6} wrap="nowrap">
                  <NumberInput
                    aria-label="Hour"
                    min={0}
                    max={23}
                    w={72}
                    value={draft.hour}
                    onChange={(v) => onChange({ hour: Math.min(23, Math.max(0, Number(v) || 0)) })}
                  />
                  <Text size="sm" c="dimmed">:</Text>
                  <NumberInput
                    aria-label="Minute"
                    min={0}
                    max={59}
                    step={5}
                    w={72}
                    value={draft.minute}
                    onChange={(v) => onChange({ minute: Math.min(59, Math.max(0, Number(v) || 0)) })}
                  />
                </Group>
              </Group>
            </SubField>
          </Box>
        </>
      )}

      <Group gap={7} mt="sm" wrap="nowrap">
        <CalendarClock size={14} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
        <Text size="sm" c="dimmed">{describe(draft)} · {timezone}</Text>
      </Group>
    </>
  );
}
