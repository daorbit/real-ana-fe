import { Box, Button, Group, Text } from "@mantine/core";
import { PostImagesField } from "../images/PostImagesField";
import type { Draft } from "../draft";

/**
 * The upload, offered where Orbit asked for it.
 *
 * Same field as the form's, so pictures attached here are the post's pictures —
 * the author does not have to go find the Image section to answer a question
 * that was asked in the thread.
 */
export function PlanImagePrompt({
  images,
  onImages,
  provider,
  optional,
  onSkip,
}: {
  images: string[];
  onImages: (next: string[]) => void;
  provider: Draft["provider"];
  /** LinkedIn posts publish fine without one. */
  optional: boolean;
  onSkip: () => void;
}) {
  return (
    <Box
      p={12}
      style={{
        border: "1px dashed var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
        background: "var(--surface)",
      }}
    >
      <PostImagesField value={images} onChange={onImages} provider={provider} />
      {optional && images.length === 0 && (
        <Group justify="flex-end" mt={10}>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={onSkip}>
            Post without an image
          </Button>
        </Group>
      )}
      {!optional && images.length === 0 && (
        <Text size="xs" c="dimmed" mt={8}>
          Instagram posts need an image before they can be scheduled.
        </Text>
      )}
    </Box>
  );
}
