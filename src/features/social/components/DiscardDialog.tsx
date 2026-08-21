import { Button, Group, Modal, Text } from "@mantine/core";

 
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
      title={<Text fw={650}>Discard {editing ? "changes" : "this post"}?</Text>}
      centered
      size="sm"
      zIndex={400}
    >
      <Text size="sm" c="dimmed" lh={1.55}>
        {editing
          ? "Your edits have not been saved. Closing now leaves the post as it was."
          : "This post has not been scheduled yet. Closing now loses what you have written."}
      </Text>
      <Group justify="flex-end" gap="sm" mt="lg">
        <Button variant="default" onClick={onKeep}>Keep editing</Button>
        <Button color="red" onClick={onDiscard}>Discard</Button>
      </Group>
    </Modal>
  );
}
