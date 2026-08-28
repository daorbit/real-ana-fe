import { Anchor, Avatar, Box, Button, Group, Stack, Text } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import type { LastUser } from "@/features/auth/lastUser";

/**
 * "Continue as ..." for whoever signed in last on this browser.
 *
 * Shown above the email form when a remembered user exists and nothing has been
 * typed yet. It carries no session — the button fills in the address and drops
 * the cursor in the password field, and a social account gets a line saying
 * which button to use. "Use another account" clears the memory outright, so a
 * shared machine has an obvious exit.
 */
const METHOD_HINT: Record<LastUser["method"], string> = {
  password: "",
  google: "You last signed in with Google — use the Google button above.",
  linkedin: "You last signed in with LinkedIn — use the LinkedIn button above.",
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
  const hint = METHOD_HINT[user.method];

  return (
    <Box className="last-user-pop surface-card" p="md">
      <Group gap="sm" wrap="nowrap" mb={hint ? 8 : "sm"}>
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

      {hint ? (
        <Text size="xs" c="dimmed" mb="xs">
          {hint}
        </Text>
      ) : (
        <Button
          fullWidth
          size="sm"
          leftSection={<ArrowRight size={14} />}
          onClick={onContinue}
        >
          Continue as {user.name.split(" ")[0] || user.name}
        </Button>
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
