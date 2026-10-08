import { useState } from "react";
import { Alert, Button, List, Modal, Stack, Text, TextInput } from "@mantine/core";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { hasIdentityFactor, identityProof, identityPrompt } from "./identityProof";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { errMessage } from "@/shared/lib/notify";
import type { User } from "@/shared/types";

export function DeleteAccountModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const { workspaces } = useWorkspace();
  const [secret, setSecret] = useState("");
  const [typedEmail, setTypedEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owned = workspaces.filter((w) => w.role === "owner");
  const needsSecret = hasIdentityFactor(user);
  const emailMatches = typedEmail.trim().toLowerCase() === user.email.toLowerCase();
  const ready = emailMatches && (!needsSecret || Boolean(secret.trim()));

  const submit = async () => {
    if (!ready) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount(typedEmail.trim(), needsSecret ? identityProof(user, secret) : undefined);
    } catch (err) {
      setError(errMessage(err, "Could not delete your account."));
      setDeleting(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Delete your account" radius="lg" size={460} centered>
      <Stack gap="md" pt={4}>
        <Text size="sm" c="dimmed">
          This permanently deletes your profile, sessions, notes, connected accounts and Orbit history. It cannot be undone.
        </Text>

        {owned.length > 0 && (
          <Alert color="red" variant="light" title="These workspaces will be deleted too">
            <List size="sm" spacing={2}>
              {owned.map((w) => (
                <List.Item key={w._id}>{w.name}</List.Item>
              ))}
            </List>
            <Text size="xs" mt="xs">
              Their sites, analytics, forms and submissions, reports and media go with them, including for every other member.
            </Text>
          </Alert>
        )}

        {error && <Alert color="red" variant="light">{error}</Alert>}

        {needsSecret && (
          <Stack gap={6}>
            <Text size="sm">{identityPrompt(user)}</Text>
            <ConfirmIdentityField user={user} value={secret} onChange={setSecret} onSubmit={() => void submit()} />
          </Stack>
        )}

        <TextInput
          label={`Type ${user.email} to confirm`}
          autoComplete="off"
          value={typedEmail}
          onChange={(e) => setTypedEmail(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
        />

        <Button fullWidth size="md" color="red" loading={deleting} disabled={!ready} onClick={() => void submit()}>
          Delete account permanently
        </Button>
      </Stack>
    </Modal>
  );
}
