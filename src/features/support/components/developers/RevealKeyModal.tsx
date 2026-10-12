import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ConfirmIdentityField } from "@/features/auth/components/settings/ConfirmIdentityField";
import { hasIdentityFactor, identityPrompt } from "@/features/auth/components/settings/identityProof";
import type { ApiKey } from "@/shared/types";
import { useRevealApiKey } from "../../hooks/useRevealApiKey";
import { SecretKeyField } from "./SecretKeyField";

interface Props {
  apiKey: ApiKey | null;
  workspaceId: string;
  onClose: () => void;
}

export function RevealKeyModal({ apiKey, workspaceId, onClose }: Props) {
  const { t } = useTranslation();
  const { user, reveal, revealing } = useRevealApiKey(workspaceId);
  const [secret, setSecret] = useState("");
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    setSecret("");
    setRaw(null);
  }, [apiKey]);

  const submit = async () => {
    if (!apiKey || !secret.trim() || revealing) return;
    const key = await reveal(apiKey, secret);
    setSecret("");
    if (key) setRaw(key);
  };

  const canConfirm = user ? hasIdentityFactor(user) : false;

  return (
    <Modal
      opened={!!apiKey}
      onClose={onClose}
      title={t("developers.revealTitle", { name: apiKey?.name ?? "" })}
      centered
      radius="lg"
      size={raw ? "lg" : "md"}
    >
      {raw && apiKey ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("developers.revealedBody")}
          </Text>
          <SecretKeyField value={raw} label={apiKey.name} />
          <Group justify="flex-end">
            <Button onClick={onClose}>{t("developers.done")}</Button>
          </Group>
        </Stack>
      ) : user && canConfirm ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("developers.revealPrompt", { prompt: identityPrompt(user) })}
          </Text>
          <ConfirmIdentityField user={user} value={secret} onChange={setSecret} onSubmit={() => void submit()} />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button loading={revealing} disabled={!secret.trim()} onClick={() => void submit()}>
              {t("developers.revealConfirm")}
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("developers.revealNoFactor")}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button component={Link} to="/app/settings/security" onClick={onClose}>
              {t("developers.openSecurity")}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
