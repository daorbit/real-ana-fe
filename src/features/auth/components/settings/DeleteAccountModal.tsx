import { useState } from "react";
import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { hasIdentityFactor, identityProof, identityPrompt } from "./identityProof";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { errMessage, notify } from "@/shared/lib/notify";
import classes from "./DeleteAccount.module.css";
import type { User } from "@/shared/types";

export function DeleteAccountModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const { workspaces } = useWorkspace();
  const [secret, setSecret] = useState("");
  const [typedEmail, setTypedEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const owned = workspaces.filter((w) => w.role === "owner");
  const needsSecret = hasIdentityFactor(user);
  const emailMatches = typedEmail.trim().toLowerCase() === user.email.toLowerCase();
  const ready = emailMatches && (!needsSecret || Boolean(secret.trim()));

  const submit = async () => {
    if (!ready) return;
    setDeleting(true);
    try {
      await deleteAccount(typedEmail.trim(), needsSecret ? identityProof(user, secret) : undefined);
    } catch (err) {
      notify.error(errMessage(err, "Could not delete your account."));
      setDeleting(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Delete your account" radius="lg" size={460} centered>
      <Stack gap="md" pt={4}>
        <Text size="sm" c="dimmed">
          This permanently deletes your profile, sessions, notes, connected accounts and Orbit history. It cannot be undone. We'll send a confirmation to {user.email}.
        </Text>

        {owned.length > 0 && (
          <section className={classes.owned} aria-label="Workspaces that will be deleted">
            <p className={classes.ownedTitle}>These workspaces will be deleted too</p>
            <ul className={classes.ownedList}>
              {owned.map((w) => (
                <li key={w._id}>{w.name}</li>
              ))}
            </ul>
            <p className={classes.ownedNote}>
              Their sites, analytics, forms and submissions, reports and media go with them, including for every other member.
            </p>
          </section>
        )}

        {needsSecret && (
          <Stack gap={6}>
            <Text size="sm">{identityPrompt(user)}</Text>
            <ConfirmIdentityField user={user} value={secret} onChange={setSecret} onSubmit={() => void submit()} />
          </Stack>
        )}

        <TextInput
          label={`Type ${user.email} to confirm`}
          autoComplete="off"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
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
