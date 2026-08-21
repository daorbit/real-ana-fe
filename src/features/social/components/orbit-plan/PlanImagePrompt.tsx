import { Box, Button, Group, Text } from "@mantine/core";
import { PostImageField } from "../PostImageField";

/**
 * The upload, offered where Orbit asked for it.
 *
 * Same field as the form's, so a picture attached here is the post's picture —
 * the author does not have to go find the Image section to answer a question
 * that was asked in the thread.
 */
export function PlanImagePrompt({
  image,
  onImage,
  optional,
  onSkip,
}: {
  image: string;
  onImage: (next: string) => void;
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
      <PostImageField value={image} onChange={onImage} />
      {optional && !image && (
        <Group justify="flex-end" mt={10}>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={onSkip}>
            Post without an image
          </Button>
        </Group>
      )}
      {!optional && !image && (
        <Text size="xs" c="dimmed" mt={8}>
          Instagram posts need an image before they can be scheduled.
        </Text>
      )}
    </Box>
  );
}
