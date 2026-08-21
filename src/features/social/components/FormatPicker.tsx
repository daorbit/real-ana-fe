import { SegmentedControl, Group, Text } from "@mantine/core";
import { Square, Smartphone } from "lucide-react";
import type { Draft } from "./draft";

/**
 * Feed post or story.
 *
 * Only shown for Instagram, and locked once a post exists — a story has no
 * caption and a different image ratio, so switching would silently invalidate
 * whatever was already written or attached.
 */
export function FormatPicker({
  value,
  onChange,
  locked,
}: {
  value: Draft["format"];
  onChange: (next: Draft["format"]) => void;
  locked?: boolean;
}) {
  return (
    <>
      <SegmentedControl
        fullWidth
        disabled={locked}
        value={value}
        onChange={(next) => onChange(next as Draft["format"])}
        data={[
          {
            value: "feed",
            label: (
              <Group gap={6} justify="center" wrap="nowrap">
                <Square size={14} />
                <span>Feed post</span>
              </Group>
            ),
          },
          {
            value: "story",
            label: (
              <Group gap={6} justify="center" wrap="nowrap">
                <Smartphone size={14} />
                <span>Story</span>
              </Group>
            ),
          },
        ]}
      />

      {value === "story" && (
        // Said before it is scheduled rather than discovered afterwards: all
        // three of these surprise someone expecting a story to behave like a
        // feed post.
        <Text size="xs" c="dimmed" mt={8} lh={1.5}>
          Stories publish one image, with no caption, and disappear after 24
          hours. Links, polls and stickers cannot be added through Instagram&apos;s
          API.
        </Text>
      )}
    </>
  );
}
