import { useRef, useState } from "react";
import { Box, FileButton, Group, SimpleGrid, Text } from "@mantine/core";
import { Image as ImageIcon, Plus } from "lucide-react";
import { MAX_IMAGES, MAX_IMAGE_MB } from "../draft";
import { ImageSlide } from "./ImageSlide";
import { ACCEPT_ATTR, readImageFiles } from "./readImageFiles";

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
}: {
  value: string[];
  onChange: (next: string[]) => void;
  provider: "linkedin" | "instagram";
}) {
  const [dragging, setDragging] = useState(false);
  const resetRef = useRef<() => void>(null);

  const room = MAX_IMAGES - value.length;

  const add = async (files: File[]) => {
    const read = await readImageFiles(files, room);
    if (read.length) onChange([...value, ...read]);
    resetRef.current?.();
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
      <FileButton resetRef={resetRef} accept={ACCEPT_ATTR} multiple onChange={add}>
        {(props) => (
          <Box
            {...props}
            component="button"
            type="button"
            onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault();
              setDragging(false);
              void add(Array.from(e.dataTransfer.files));
            }}
            style={{
              width: "100%",
              padding: "28px 16px",
              cursor: "pointer",
              background: "transparent",
              border: `1px dashed ${dragging ? "var(--accent)" : "var(--mantine-color-default-border)"}`,
              borderRadius: "var(--mantine-radius-md)",
              color: "inherit",
            }}
          >
            <ImageIcon size={20} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text size="sm" mt={8}>Drop images, or click to choose</Text>
            <Text size="xs" c="dimmed" mt={4}>
              PNG, JPEG or WebP · up to {MAX_IMAGE_MB}MB each · {MAX_IMAGES} max
            </Text>
          </Box>
        )}
      </FileButton>
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
          <FileButton resetRef={resetRef} accept={ACCEPT_ATTR} multiple onChange={add}>
            {(props) => (
              <Box
                {...props}
                component="button"
                type="button"
                aria-label="Add images"
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
          </FileButton>
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
        <Text size="xs" c="dimmed">{value.length} / {MAX_IMAGES}</Text>
      </Group>
    </div>
  );
}
