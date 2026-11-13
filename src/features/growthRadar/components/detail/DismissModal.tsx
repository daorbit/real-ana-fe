import { useState } from "react";
import { Button, Group, Modal, Radio, Stack, TextInput } from "@mantine/core";
import { DISMISS_REASONS } from "../../lib/labels";

const OTHER = "other";

export function DismissModal({
  opened,
  busy,
  onClose,
  onDismiss,
}: {
  opened: boolean;
  busy: boolean;
  onClose: () => void;
  onDismiss: (reason: string) => void;
}) {
  const [choice, setChoice] = useState<string>(DISMISS_REASONS[0]);
  const [other, setOther] = useState("");
  const reason = choice === OTHER ? other.trim() : choice;

  return (
    <Modal opened={opened} onClose={onClose} title="Dismiss this finding" centered radius="md">
      <Stack gap="md">
        <Radio.Group value={choice} onChange={setChoice} label="Why? This helps tune future checks.">
          <Stack gap="xs" mt="xs">
            {DISMISS_REASONS.map((r) => (
              <Radio key={r} value={r} label={r} />
            ))}
            <Radio value={OTHER} label="Something else" />
          </Stack>
        </Radio.Group>
        {choice === OTHER && (
          <TextInput value={other} onChange={(e) => setOther(e.currentTarget.value)} maxLength={300} placeholder="Tell us briefly" aria-label="Reason" />
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={() => onDismiss(reason)}>
            Dismiss
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
