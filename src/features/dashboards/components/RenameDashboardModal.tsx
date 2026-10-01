import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";

export function RenameDashboardModal({
  opened,
  name,
  onClose,
  onSave,
}: {
  opened: boolean;
  name: string;
  onClose: () => void;
  onSave: (next: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) setValue(name);
  }, [opened, name]);

  const next = value.trim();
  const unchanged = !next || next === name;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (unchanged) return;
    setSaving(true);
    const ok = await onSave(next);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={650}>Rename dashboard</Text>} size={440}>
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            value={value}
            maxLength={80}
            onChange={(e) => setValue(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" color="emerald" loading={saving} disabled={unchanged}>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
