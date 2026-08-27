import { Box, Group, Text } from "@mantine/core";
import { useFitScale } from "@/hooks/useFitScale";
import { LinkedInPreview } from "./LinkedInPreview";
import { InstagramPreview } from "./InstagramPreview";
import { StoryPreview } from "./StoryPreview";
import { DeviceFrame, frameSize } from "./DeviceFrame";
import { describe, type Draft } from "./draft";
import type { PreviewDevice } from "./ComposerPaneControls";

/** The pane's device toggle only knows desktop/mobile; the chassis has real hardware names. */
const DEVICE_ID = { desktop: "macbook", mobile: "iphone" } as const;

export type PaneTab = "preview" | "orbit";

/**
 * The composer's right half: the post as it will look, or Orbit planning it.
 *
 * The switch between the two lives in the composer's title bar — see
 * `ComposerPaneControls` — so this file is only the surface itself.
 */
export function ComposerPreviewPane({
  draft,
  author,
  tab,
  device,
  controls,
  orbit,
}: {
  draft: Draft;
  author: string;
  tab: PaneTab;
  device: PreviewDevice;
  /** The pane switch and device icons, sitting in this column's own top row. */
  controls: React.ReactNode;
  /** Orbit's pane, rendered here so this file stays about layout. */
  orbit: React.ReactNode;
}) {
  const when = draft.mode === "once" ? describe(draft) : `${describe(draft)} · scheduled`;
  const deviceId = draft.format === "story" ? "iphone" : DEVICE_ID[device];
  const size = frameSize(deviceId);
  const { ref: stageRef, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 24, y: 24 },
  });

  return (
    <Box className="share-post-preview">
      {/* Pane switch at one end, device width at the other — what is shown and
          how wide it is shown are separate decisions. */}
      <Group justify="space-between" align="center" wrap="nowrap" mb="md">
        {controls}
      </Group>

      {tab === "orbit" ? (
        <Box style={{ flex: 1, minHeight: 0 }}>{orbit}</Box>
      ) : (
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Text size="xs" c="dimmed" ta="center" mb={10}>
            approximate — {draft.format === "story"
              ? "Instagram story"
              : draft.provider === "instagram"
                ? "Instagram feed"
                : "LinkedIn feed"}
          </Text>

          <Box
            ref={stageRef}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}
          >
            <DeviceFrame device={deviceId} scale={scale} hidden={!measured}>
              {draft.format === "story" ? (
                <StoryPreview author={author} image={draft.images[0] ?? ""} when={when} />
              ) : (
                draft.provider === "instagram" ? (
                  <InstagramPreview
                    author={author}
                    caption={draft.caption}
                    images={draft.images}
                    when={when}
                    device={device}
                  />
                ) : (
                  <LinkedInPreview
                    author={author}
                    headline="Publishing through Quantalog"
                    caption={draft.caption}
                    images={draft.images}
                    when={when}
                    device={device}
                  />
                )
              )}
            </DeviceFrame>
          </Box>
        </Box>
      )}
    </Box>
  );
}
