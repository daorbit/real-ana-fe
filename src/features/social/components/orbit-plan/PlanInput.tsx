import { useState } from "react";
import { ActionIcon, Group, Textarea, Tooltip } from "@mantine/core";
import { ArrowUp, ImagePlus, Palette, X } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import classes from "./planInput.module.css";

export function PlanInput({
  value,
  onChange,
  onSend,
  thinking,
  placeholder,
  minRows = 1,
  workspaceId,
  images,
  onImages,
  onDraw,
  drawing,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  thinking: boolean;
  placeholder: string;
  minRows?: number;
  /** When given, the composer offers attach/draw buttons that write straight
   * into the post's own image list. */
  workspaceId?: string;
  images?: string[];
  onImages?: (next: string[]) => void;
  /** Draw a picture — the prompt goes in as a real turn in the conversation,
   * not a side form, so Orbit can refer back to what it drew. */
  onDraw?: (prompt: string) => void;
  drawing?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  // Toggling this swaps what the one textarea is for and what the send arrow
  // does — a second input box beside it would just be the same field twice.
  const [drawMode, setDrawMode] = useState(false);

  const canAttach = Boolean(workspaceId && onImages);
  const canDraw = Boolean(workspaceId && onDraw);

  const submit = () => {
    if (drawMode) {
      if (!value.trim() || !onDraw) return;
      onDraw(value.trim());
      onChange("");
      setDrawMode(false);
    } else {
      onSend();
    }
  };

  return (
    <div className={classes.composer}>
      {canAttach && images && images.length > 0 && (
        <Group gap={6} px={2} pb={6} wrap="wrap">
          {images.map((url) => (
            <div key={url} className={classes.imageChip}>
              <img src={url} alt="Attached" />
              <ActionIcon
                size="xs"
                radius="xl"
                variant="default"
                onClick={() => onImages!(images.filter((u) => u !== url))}
                aria-label="Remove image"
              >
                <X size={11} />
              </ActionIcon>
            </div>
          ))}
        </Group>
      )}

      <Textarea
        autosize
        minRows={minRows}
        maxRows={Math.max(5, minRows + 3)}
        placeholder={drawMode ? "Describe what to draw" : placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          // Enter sends, shift+enter breaks the line.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape" && drawMode) setDrawMode(false);
        }}
        variant="unstyled"
        disabled={thinking || drawing}
        autoFocus={drawMode}
        styles={{
          input: {
            fontSize: 14,
            lineHeight: 1.6,
            background: "transparent",
            border: "none",
            boxShadow: "none",
          },
        }}
      />

      <Group justify="space-between" align="center" wrap="nowrap" mt={4}>
        <Group gap={4} wrap="nowrap">
          {canAttach && !drawMode && (
            <Tooltip label="Attach an image" withArrow>
              <ActionIcon
                size="md"
                radius="xl"
                variant="subtle"
                color="gray"
                disabled={thinking}
                onClick={() => setPicking(true)}
                aria-label="Attach an image"
              >
                <ImagePlus size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {canDraw && (
            <Tooltip label={drawMode ? "Cancel drawing" : "Draw a picture"} withArrow>
              <ActionIcon
                size="md"
                radius="xl"
                variant={drawMode ? "filled" : "subtle"}
                color={drawMode ? "emerald" : "gray"}
                disabled={thinking || drawing}
                onClick={() => setDrawMode((v) => !v)}
                aria-label={drawMode ? "Cancel drawing" : "Draw a picture"}
              >
                {drawMode ? <X size={16} /> : <Palette size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        <ActionIcon
          size="md"
          radius="xl"
          color="emerald"
          variant="filled"
          loading={thinking || drawing}
          disabled={!value.trim()}
          onClick={submit}
          aria-label={drawMode ? "Draw it" : "Send to Orbit"}
        >
          {drawMode ? <Palette size={16} /> : <ArrowUp size={16} />}
        </ActionIcon>
      </Group>

      {canAttach && (
        <MediaPickerModal
          opened={picking}
          onClose={() => setPicking(false)}
          onPick={(asset) => onImages!([...(images ?? []), asset.url])}
          kind="image"
          title="Choose an image"
        />
      )}
    </div>
  );
}
