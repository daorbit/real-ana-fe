import { Anchor, Group, Text } from "@mantine/core";

interface Props {
  lockedReason?: string;
  failed: boolean;
  onRetry: () => void;
}

export function FormsNotice({ lockedReason, failed, onRetry }: Props) {
  if (lockedReason) {
    return (
      <Text size="sm" c="dimmed" mt="lg">
        {lockedReason}
      </Text>
    );
  }
  if (!failed) return null;
  return (
    <Group gap={6} mt="lg">
      <Text size="sm" c="dimmed">
        Your form apps could not be loaded.
      </Text>
      <Anchor component="button" type="button" size="sm" onClick={onRetry}>
        Try again
      </Anchor>
    </Group>
  );
}
