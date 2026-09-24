import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";
import bannerSrc from "@/assets/banners/discard-post-banner.svg";

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
      centered
      size={440}
      padding={0}
      withCloseButton={false}
      zIndex={400}
    >
      <Stack gap={0} className="verify-card" pos="relative">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onKeep}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
        >
          <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
        </ActionIcon>
        <div
          style={{
            height: 154,
            backgroundImage: `url(${bannerSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Stack gap="lg" p={26}>
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
      </Stack>
    </Modal>
  );
}
