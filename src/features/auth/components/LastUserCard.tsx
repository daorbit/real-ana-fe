import { Anchor, Avatar, Box, Button, Group, Stack, Text } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import type { LastUser } from "@/features/auth/lastUser";

/**
 * "Continue as ..." for whoever signed in last on this browser.
 *
 * Floated in the corner of the login screen when a remembered user exists and
 * nothing has been typed yet. It carries no session — the button fills the
 * email field and moves the cursor to the password box; a social account also
 * gets a one-line reminder of which provider it was. "Use another account"
 * clears the memory outright, so a shared machine has an obvious exit.
 */
const METHOD_LABEL: Record<LastUser["method"], string> = {
  password: "",
  google: "Last signed in with Google",
  linkedin: "Last signed in with LinkedIn",
};

export function LastUserCard({
  user,
  onContinue,
  onForget,
}: {
  user: LastUser;
  /** Prefill the email field and move focus to the password input. */
  onContinue: () => void;
  onForget: () => void;
}) {
  const initials =
    user.name.trim().slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const methodLabel = METHOD_LABEL[user.method];
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <Box className="last-user-pop surface-card" p="md">
      <Group gap="sm" wrap="nowrap" mb="sm">
        <Avatar src={user.avatarUrl || null} radius="xl" size={36} color="violet">
          {initials}
        </Avatar>
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text fw={600} size="sm" truncate>
            {user.name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {user.email}
          </Text>
        </Stack>
      </Group>

      <Button
        fullWidth
        size="sm"
        leftSection={<ArrowRight size={14} />}
        onClick={onContinue}
      >
        Continue as {firstName}
      </Button>

      {methodLabel && (
        <Text size="xs" c="dimmed" ta="center" mt={6}>
          {methodLabel}
        </Text>
      )}

      <Anchor
        component="button"
        type="button"
        size="xs"
        c="dimmed"
        mt={8}
        onClick={onForget}
        style={{ display: "block", width: "100%", textAlign: "center" }}
      >
        Not you? Use another account
      </Anchor>
    </Box>
  );
}
