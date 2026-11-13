import { useState } from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import classes from "../Opportunity.module.css";

const DAY_MS = 86_400_000;
const MAX_DAYS = 180;
const QUICK = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export function SnoozeModal({
  opened,
  busy,
  onClose,
  onSnooze,
}: {
  opened: boolean;
  busy: boolean;
  onClose: () => void;
  onSnooze: (untilIso: string) => void;
}) {
  const [day, setDay] = useState<string | null>(null);
  const today = Date.now();
  const pick = (value: string) => onSnooze(`${value}T06:00:00.000Z`);

  return (
    <Modal opened={opened} onClose={onClose} title="Snooze this finding" centered radius="md">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          It leaves your list until the date you pick, then comes back if it is still detected.
        </Text>
        <div className={classes.quickPicks}>
          {QUICK.map((q) => (
            <Button key={q.days} variant="default" disabled={busy} onClick={() => pick(isoDay(new Date(today + q.days * DAY_MS)))}>
              {q.label}
            </Button>
          ))}
        </div>
        <DatePickerInput
          label="Or pick a date"
          value={day}
          onChange={setDay}
          minDate={isoDay(new Date(today + DAY_MS))}
          maxDate={isoDay(new Date(today + MAX_DAYS * DAY_MS))}
          placeholder="Choose a day"
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!day} onClick={() => day && pick(day)}>
            Snooze
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
