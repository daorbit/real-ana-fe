import { useRef, useState } from "react";
import { ActionIcon, Box, FileButton, Group, Text, Tooltip } from "@mantine/core";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { MAX_IMAGE_MB, readAsDataUrl } from "./draft";

const ACCEPT = "image/png,image/jpeg,image/webp";

/**
 * The post's image: a drop zone until there is one, the image itself after.
 *
 * Dropping a file is how people move an image from a folder into a post, so the
 * zone takes a drop as well as a click. The value is always a data URL for a
 * new upload or an https URL for one already stored — the server tells the two
 * apart and only re-uploads the former.
 */
export function PostImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const resetRef = useRef<() => void>(null);

  const pick = async (file: File | null) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      notify.error("Images must be PNG, JPEG or WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      notify.error(`Image must be ${MAX_IMAGE_MB}MB or smaller.`);
      resetRef.current?.();
      return;
    }
    try {
      onChange(await readAsDataUrl(file));
    } catch {
      notify.error("Could not read that image.");
    }
  };

  if (value) {
    return (
      <Box
        style={{
          position: "relative",
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          border: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <img src={value} alt="" style={{ display: "block", width: "100%", maxHeight: 220, objectFit: "cover" }} />
        <Group gap={6} style={{ position: "absolute", top: 8, right: 8 }}>
          <FileButton resetRef={resetRef} accept={ACCEPT} onChange={pick}>
            {(props) => (
              <Tooltip label="Replace" withArrow>
                <ActionIcon {...props} variant="filled" color="dark" size="md" aria-label="Replace image">
                  <Upload size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>
          <Tooltip label="Remove" withArrow>
            <ActionIcon
              variant="filled"
              color="dark"
              size="md"
              aria-label="Remove image"
              onClick={() => {
                onChange("");
                resetRef.current?.();
              }}
            >
              <Trash2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
    );
  }

  return (
    <FileButton resetRef={resetRef} accept={ACCEPT} onChange={pick}>
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
            pick(e.dataTransfer.files?.[0] ?? null);
          }}
          style={{
            width: "100%",
            padding: "22px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            background: dragging ? "var(--mantine-color-default-hover)" : "transparent",
            border: `1px dashed ${dragging ? "var(--accent)" : "var(--mantine-color-default-border)"}`,
            borderRadius: "var(--mantine-radius-md)",
            color: "var(--mantine-color-dimmed)",
          }}
        >
          <ImageIcon size={20} />
          <Text size="sm">Drop an image, or click to choose</Text>
          <Text size="xs" c="dimmed">PNG, JPEG or WebP · up to {MAX_IMAGE_MB}MB</Text>
        </Box>
      )}
    </FileButton>
  );
}
