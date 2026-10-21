import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { ConfirmIdentityField } from "@/features/auth/components/settings/ConfirmIdentityField";
import { hasIdentityFactor, identityPrompt } from "@/features/auth/components/settings/identityProof";
import type { AdminUser } from "@/shared/types";

interface Props {
  target: AdminUser | null;
  busy: boolean;
  onConfirm: (secret: string) => Promise<boolean>;
  onClose: () => void;
}

export function GrantSuperAdminModal({ target, busy, onConfirm, onClose }: Props) {
  const { user } = useAuth();
  const [secret, setSecret] = useState("");

  useEffect(() => setSecret(""), [target]);

  const submit = async () => {
    if (!secret.trim() || busy) return;
    const ok = await onConfirm(secret);
    setSecret("");
    if (ok) onClose();
  };

  const canConfirm = user ? hasIdentityFactor(user) : false;

  return (
    <Modal opened={Boolean(target)} onClose={onClose} title="Make this person a super admin?" centered radius="lg">
      {target && user && canConfirm ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            <b>{target.name}</b> ({target.email}) will have full control of the platform: every account, plan, price
            and setting, and they can make other people super admins too.
          </Text>
          <Text size="sm">{identityPrompt(user)} to continue.</Text>
          <ConfirmIdentityField user={user} value={secret} onChange={setSecret} onSubmit={() => void submit()} />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button color="red" loading={busy} disabled={!secret.trim()} onClick={() => void submit()}>
              Make super admin
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Granting super admin needs your password or PIN. Set one in Security settings first.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button component={Link} to="/app/settings/security" onClick={onClose}>
              Open Security settings
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
