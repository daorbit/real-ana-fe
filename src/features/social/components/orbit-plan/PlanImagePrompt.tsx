import { useState } from "react";
import { Box, Button, Group, Loader, Stack, Text, TextInput } from "@mantine/core";
import { Palette } from "lucide-react";
import { usePlanImageMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { PostImagesField } from "../images/PostImagesField";
import type { Draft } from "../draft";

/**
 * The upload, offered where Orbit asked for it.
 *
 * Same field as the form's, so pictures attached here are the post's pictures —
 * the author does not have to go find the Image section to answer a question
 * that was asked in the thread. A generate option sits beside it for someone
 * with nothing to upload yet.
 */
export function PlanImagePrompt({
  workspaceId,
  images,
  onImages,
  provider,
  optional,
  onSkip,
}: {
  workspaceId: string | undefined;
  images: string[];
  onImages: (next: string[]) => void;
  provider: Draft["provider"];
  /** LinkedIn posts publish fine without one. */
  optional: boolean;
  onSkip: () => void;
}) {
  const [drawing, setDrawing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generate, { isLoading: generating }] = usePlanImageMutation();

  const draw = async () => {
    if (!workspaceId || !prompt.trim()) return;
    try {
      const res = await generate({ workspaceId, prompt: prompt.trim() }).unwrap();
      onImages([...images, res.imageUrl]);
      setPrompt("");
      setDrawing(false);
    } catch (e) {
      notify.error(errMessage(e, "Orbit could not draw that."));
    }
  };

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

      {drawing ? (
        <Stack gap={8} mt={10}>
          <TextInput
            size="sm"
            placeholder="Describe what to draw"
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void draw();
              }
            }}
            disabled={generating}
            autoFocus
          />
          <Group justify="flex-end" gap={8}>
            <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setDrawing(false)}>
              Cancel
            </Button>
            <Button
              size="compact-xs"
              leftSection={generating ? <Loader size={12} /> : <Palette size={13} />}
              disabled={!prompt.trim() || generating}
              onClick={() => void draw()}
            >
              Draw it
            </Button>
          </Group>
        </Stack>
      ) : (
        <Group justify="space-between" mt={10}>
          <Button
            size="compact-xs"
            variant="light"
            leftSection={<Palette size={13} />}
            onClick={() => setDrawing(true)}
          >
            Draw one instead
          </Button>
          {optional && images.length === 0 && (
            <Button size="compact-xs" variant="subtle" color="gray" onClick={onSkip}>
              Post without an image
            </Button>
          )}
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
