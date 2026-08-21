import { useState } from "react";
import { ActionIcon, Box, Group, SegmentedControl, Text } from "@mantine/core";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { LinkedInPreview } from "./LinkedInPreview";
import { InstagramPreview } from "./InstagramPreview";
import { describe, type Draft } from "./draft";

export type PaneTab = "preview" | "orbit";

/**
 * The composer's right half: the post as it will look, or Orbit planning it.
 *
 * One pane rather than two, because they are the same subject seen twice — and
 * a chat panel wedged into the form pushed the fields it fills off the screen.
 */
export function ComposerPreviewPane({
  draft,
  author,
  tab,
  onTab,
  orbit,
}: {
  draft: Draft;
  author: string;
  tab: PaneTab;
  onTab: (next: PaneTab) => void;
  /** Orbit's pane, rendered here so this file stays about layout. */
  orbit: React.ReactNode;
}) {
  const [device, setDevice] = useDeviceState();
  const when = draft.mode === "once" ? describe(draft) : `${describe(draft)} · scheduled`;

  return (
    <Box className="share-post-preview">
      <Group justify="space-between" align="center" mb="lg" wrap="nowrap">
        <SegmentedControl
          value={tab}
          onChange={(value) => onTab(value as PaneTab)}
          style={{ flex: 1, maxWidth: 420 }}
          data={[
            {
              value: "preview",
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <Eye size={14} />
                  <span>Preview</span>
                </Group>
              ),
            },
            {
              value: "orbit",
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <OrbitMark size={14} />
                  <span>Schedule with Orbit</span>
                </Group>
              ),
            },
          ]}
        />

        {tab === "preview" && (
          <Group gap={4} p={4} style={{ background: "var(--mantine-color-default)", borderRadius: "var(--mantine-radius-md)" }}>
            {([
              { id: "desktop" as const, Icon: Monitor },
              { id: "mobile" as const, Icon: Smartphone },
            ]).map(({ id, Icon }) => (
              <ActionIcon
                key={id}
                variant={device === id ? "white" : "subtle"}
                color={device === id ? "dark" : "gray"}
                size="lg"
                radius="sm"
                onClick={() => setDevice(id)}
                aria-label={id}
                aria-pressed={device === id}
              >
                <Icon size={17} />
              </ActionIcon>
            ))}
          </Group>
        )}
      </Group>

      {tab === "orbit" ? (
        <Box style={{ flex: 1, minHeight: 0 }}>{orbit}</Box>
      ) : (
        <Box style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
          <Box w="100%">
            <Text size="xs" c="dimmed" ta="center" mb={10}>
              approximate — {draft.provider === "instagram" ? "Instagram" : "LinkedIn"} feed
            </Text>
            {draft.provider === "instagram" ? (
              <InstagramPreview
                author={author}
                caption={draft.caption}
                image={draft.image}
                when={when}
                device={device}
              />
            ) : (
              <LinkedInPreview
                author={author}
                headline="Publishing through Quantalog"
                caption={draft.caption}
                image={draft.image}
                when={when}
                device={device}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/** Device choice, local to the preview — nothing else reads it. */
function useDeviceState() {
  return useState<"desktop" | "mobile">("desktop");
}
