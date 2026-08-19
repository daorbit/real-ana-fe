import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";

/**
 * An hour of a day with nothing in it yet.
 *
 * The empty slots are what make the queue read as a plan rather than as a list:
 * a day with two posts and four gaps says "there is room on Thursday", where
 * the same day rendered as two cards says only "there are two posts". Clicking
 * one opens the composer already carrying that instant, so the gap is filled
 * where it was seen rather than by re-picking the time in a dialog.
 *
 * Nothing is stored behind these — they are the shape of the day, not records.
 */
export function PostSlotEmpty({
  at,
  disabled,
  onCreate,
}: {
  /** The instant this slot would publish at, as ISO. */
  at: string;
  disabled?: boolean;
  onCreate: (at: string) => void;
}) {
  const time = new Date(at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Group className="post-slot" align="flex-start" wrap="nowrap" gap={0}>
      <Box className="post-slot__time post-slot__time--empty">
        <Text size="sm" fw={500} c="dimmed">{time}</Text>
      </Box>

      <UnstyledButton
        className="post-slot__empty"
        disabled={disabled}
        onClick={() => onCreate(at)}
      >
        <Group gap={8} wrap="nowrap">
          <Plus size={15} />
          <Text size="sm" fw={500}>New</Text>
        </Group>
      </UnstyledButton>
    </Group>
  );
}
