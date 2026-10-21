import { Button, Group, Modal, Stack, Text } from "@mantine/core";

export function DiscardDialog({
  opened,
  onKeep,
  onDiscard,
  editing,
}: {
  opened: boolean;
  onKeep: () => void;
  onDiscard: () => void;
  /** Changes to an existing post read differently from a new draft. */
  editing: boolean;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onKeep}
      title={editing ? "Discard your changes?" : "Discard this post?"}
      centered
      radius="lg"
      size={440}
      zIndex={400}
    >
      <Stack gap="lg">
        <Stack gap={4}>
          <Text size="sm" c="dimmed" lh={1.55}>
            {editing
              ? "Your edits have not been saved. Closing now leaves the post as it was before you started editing."
              : "This post has not been scheduled or published yet. Closing now discards it completely — there's no draft to come back to."}
          </Text>
          {editing && (
            <Text size="sm" c="dimmed" lh={1.55}>
              The original version stays untouched, so this is safe to do.
            </Text>
          )}
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onKeep}>Keep editing</Button>
          <Button color="red" onClick={onDiscard}>Discard</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
