import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ApiKey } from "@/shared/types";

interface Props {
  apiKey: ApiKey | null;
  saving: boolean;
  onClose: () => void;
  onSave: (key: ApiKey, name: string) => Promise<boolean>;
}

export function RenameKeyModal({ apiKey, saving, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  useEffect(() => setName(apiKey?.name ?? ""), [apiKey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !name.trim()) return;
    if (await onSave(apiKey, name)) onClose();
  };

  return (
    <Modal opened={!!apiKey} onClose={onClose} title={t("developers.renameTitle")} centered radius="lg">
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            label={t("developers.keyName")}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            maxLength={80}
            data-autofocus
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={saving} disabled={!name.trim() || name.trim() === apiKey?.name}>
              {t("common.save")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
