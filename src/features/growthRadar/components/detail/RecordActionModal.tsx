import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { ActionDraft } from "../../types";

const DAY_MS = 86_400_000;
const BACKDATE_DAYS = 30;
const MAX_TEXT = 500;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export function RecordActionModal({
  opened,
  busy,
  metricLabel,
  followUpDays,
  onClose,
  onSave,
}: {
  opened: boolean;
  busy: boolean;
  metricLabel: string;
  followUpDays: number;
  onClose: () => void;
  onSave: (draft: ActionDraft) => void;
}) {
  const today = isoDay(new Date());
  const [description, setDescription] = useState("");
  const [otherChanges, setOtherChanges] = useState("");
  const [day, setDay] = useState<string | null>(today);

  const save = () =>
    onSave({
      description: description.trim(),
      otherChanges: otherChanges.trim(),
      startedAt: day && day !== today ? `${day}T00:00:00.000Z` : undefined,
    });

  return (
    <Modal opened={opened} onClose={onClose} title="Record what you changed" centered radius="md" size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Growth Radar keeps today's value of “{metricLabel}” and measures it again over the {followUpDays} days after your change.
          The result is an observed change, not proof that your change caused it.
        </Text>
        <Textarea
          label="What did you change?"
          placeholder="Moved the enquiry form above the pricing table"
          autosize
          minRows={2}
          maxLength={MAX_TEXT}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <DatePickerInput
          label="When did it go live?"
          value={day}
          onChange={setDay}
          minDate={isoDay(new Date(Date.now() - BACKDATE_DAYS * DAY_MS))}
          maxDate={today}
        />
        <Textarea
          label="Anything else that changed around the same time?"
          description="A campaign, a price change, a holiday. Shown next to the result so it is read fairly."
          autosize
          minRows={2}
          maxLength={MAX_TEXT}
          value={otherChanges}
          onChange={(e) => setOtherChanges(e.currentTarget.value)}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={description.trim().length < 3} onClick={save}>
            Start tracking
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
