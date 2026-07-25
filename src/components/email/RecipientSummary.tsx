import {
  Group, Text, Box, Stack, Collapse, ScrollArea, UnstyledButton,
} from "@mantine/core";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { AdminUser } from "../../types";
import type { EmailComposerState } from "../../hooks/useEmailComposer";

/**
 * Who this is going to, kept visible while writing.
 *
 * The list itself is behind a toggle: it is reassurance before pressing Send,
 * not something that needs reading on every keystroke. Sending to people is not
 * undoable, so being able to check the names at all is what makes a wrong pick
 * recoverable.
 */
export function RecipientSummary({
  state,
  user,
}: {
  state: EmailComposerState;
  user?: AdminUser | null;
}) {
  const { single, recipients, loadingRecipients, showList, setShowList } = state;

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <Text size="sm" c="dimmed">To</Text>
          {single ? (
            <Text size="sm" fw={600} truncate>
              {user?.name}{" "}
              <Text span c="dimmed" fw={400}>· {user?.email}</Text>
            </Text>
          ) : (
            <Text size="sm" fw={600}>
              {loadingRecipients
                ? "…"
                : `${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`}
            </Text>
          )}
        </Group>
        {!single && recipients.length > 0 && (
          <UnstyledButton onClick={() => setShowList((v) => !v)}>
            <Group gap={3}>
              <Text size="xs" c="emerald.6" fw={500}>
                {showList ? "Hide" : "View"}
              </Text>
              {showList ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </Group>
          </UnstyledButton>
        )}
      </Group>

      <Collapse expanded={showList}>
        <ScrollArea.Autosize mah={140} mt="xs">
          <Stack gap={2}>
            {recipients.map((r) => (
              // Keyed on the address: a hand-entered recipient has no id, and
              // the address is unique either way — the parser drops duplicates.
              <Text key={r.email} size="xs" c="dimmed">
                {r.name} · {r.email}
              </Text>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      </Collapse>
    </Box>
  );
}
