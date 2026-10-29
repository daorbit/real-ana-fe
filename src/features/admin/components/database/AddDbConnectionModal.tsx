import { Button, Group, Modal, NumberInput, PasswordInput, Stack, TextInput } from "@mantine/core";
import type { DbConnectionDraft } from "../../useAddDbConnectionForm";

type Props = {
  opened: boolean;
  draft: DbConnectionDraft;
  saving: boolean;
  canSubmit: boolean;
  set: <K extends keyof DbConnectionDraft>(key: K, value: DbConnectionDraft[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AddDbConnectionModal({ opened, draft, saving, canSubmit, set, onClose, onSubmit }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="Add a database" radius="lg" centered>
      <Stack gap="sm">
        <TextInput
          label="Name"
          description="Shown on its tab."
          value={draft.label}
          onChange={(e) => set("label", e.currentTarget.value)}
          placeholder="Forms database"
          maxLength={40}
          data-autofocus
        />
        <PasswordInput
          label="Connection string"
          description="Stored encrypted and never shown again. A read-only user is enough."
          value={draft.uri}
          onChange={(e) => set("uri", e.currentTarget.value)}
          placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
          autoComplete="off"
        />
        <TextInput
          label="Database"
          description="Leave empty to use the one named in the connection string."
          value={draft.dbName}
          onChange={(e) => set("dbName", e.currentTarget.value)}
          placeholder="dbname"
        />
        <NumberInput
          label="Storage limit"
          description="512 MB for an Atlas M0 free cluster."
          value={draft.limitMb}
          onChange={(v) => set("limitMb", Number(v) || 512)}
          min={1}
          max={1048576}
          suffix=" MB"
          thousandSeparator=","
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button loading={saving} disabled={!canSubmit} onClick={onSubmit}>
            Connect and add
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
