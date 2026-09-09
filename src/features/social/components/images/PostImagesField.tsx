import { useState } from "react";
import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import { Images as ImagesIcon, Plus } from "lucide-react";
import { MAX_IMAGES } from "../draft";
import { ImageSlide } from "./ImageSlide";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";

/**
 * The post's images, in the order they will publish.
 *
 * One field for both cases: a single image is a slide count of one, and a
 * carousel is the same field with more in it. Splitting them into "image" and
 * "carousel" modes would make the author choose a shape before they have chosen
 * their pictures.
 */
export function PostImagesField({
  value,
  onChange,
  /** Instagram publishes a carousel; LinkedIn a multi-image post. */
  provider,
  /** Lower ceiling than the network's own — a story takes exactly one. */
  max = MAX_IMAGES,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  provider: "linkedin" | "instagram";
  max?: number;
}) {
  const [picking, setPicking] = useState(false);

  const room = max - value.length;

  /** One more picture from the library, unless the post is already full. */
  const add = (url: string) => {
    if (room <= 0) return;
    onChange([...value, url]);
  };

  const move = (from: number, to: number) => {
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  if (value.length === 0) {
    return (
      <>
        <Box
          component="button"
          type="button"
          onClick={() => setPicking(true)}
          style={{
            width: "100%",
            padding: "28px 16px",
            cursor: "pointer",
            background: "transparent",
            border: "1px dashed var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
            color: "inherit",
          }}
        >
          <ImagesIcon size={20} style={{ color: "var(--mantine-color-dimmed)" }} />
          <Text size="sm" mt={8}>
            {max === 1 ? "Choose an image" : "Choose images"}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            From your media library{max > 1 ? ` · ${max} max` : ""}
          </Text>
        </Box>

        <MediaPickerModal
          opened={picking}
          onClose={() => setPicking(false)}
          onPick={(asset) => add(asset.url)}
          kind="image"
          title="Choose an image"
        />
      </>
    );
  }

  return (
    <div>
      <SimpleGrid cols={{ base: 3, sm: 4 }} spacing={8}>
        {value.map((url, i) => (
          <ImageSlide
            key={`${url.slice(0, 40)}-${i}`}
            url={url}
            index={i}
            total={value.length}
            onMove={move}
            onRemove={remove}
          />
        ))}

        {room > 0 && (
          <Box
            component="button"
            type="button"
            aria-label="Add images"
            onClick={() => setPicking(true)}
            style={{
              aspectRatio: "1 / 1",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              background: "transparent",
              border: "1px dashed var(--mantine-color-default-border)",
              borderRadius: "var(--mantine-radius-md)",
              color: "var(--mantine-color-dimmed)",
            }}
          >
            <Plus size={18} />
          </Box>
        )}

      </SimpleGrid>

      <Group justify="space-between" mt={8} wrap="nowrap">
        <Text size="xs" c="dimmed">
          {value.length === 1
            ? "One image."
            : provider === "instagram"
              ? `Carousel of ${value.length}. Swipe order is left to right.`
              : `Multi-image post of ${value.length}.`}
        </Text>
        {/* No counter when only one is allowed — "1 / 1" states a limit that
            was never in question. */}
        {max > 1 && <Text size="xs" c="dimmed">{value.length} / {max}</Text>}
      </Group>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => add(asset.url)}
        kind="image"
        title="Add an image"
      />
    </div>
  );
}
