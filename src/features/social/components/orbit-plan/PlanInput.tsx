import { useState } from "react";
import { ActionIcon, Group, Loader, Textarea, Tooltip } from "@mantine/core";
import { ArrowUp, ImagePlus, Palette, X } from "lucide-react";
import { usePlanImageMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
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
}) {
  const [picking, setPicking] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [drawPrompt, setDrawPrompt] = useState("");
  const [generate, { isLoading: generating }] = usePlanImageMutation();

  const canAttach = Boolean(workspaceId && onImages);

  const draw = async () => {
    if (!workspaceId || !onImages || !drawPrompt.trim()) return;
    try {
      const res = await generate({ workspaceId, prompt: drawPrompt.trim() }).unwrap();
      onImages([...(images ?? []), res.imageUrl]);
      setDrawPrompt("");
      setDrawing(false);
    } catch (e) {
      notify.error(errMessage(e, "Orbit could not draw that."));
    }
  };

  return (
    <div className={classes.composer}>
      {/* Inline thumbnails with a dismiss on each, above the text — the
          author sees exactly what will ship and can drop one without
          restarting the message. */}
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

      {/* Clicking "Draw a picture" swaps the send row for a prompt box, right
          where the button was — a second input appearing in place, not a
          popover floating off to the side. */}
      {drawing && (
        <Group gap={8} px={2} pb={6} wrap="nowrap">
          <Textarea
            size="xs"
            style={{ flex: 1 }}
            placeholder="Describe what to draw"
            value={drawPrompt}
            onChange={(e) => setDrawPrompt(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void draw();
              }
            }}
            disabled={generating}
            autoFocus
          />
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => setDrawing(false)}
            aria-label="Cancel drawing"
          >
            <X size={13} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            color="emerald"
            variant="filled"
            disabled={!drawPrompt.trim() || generating}
            onClick={() => void draw()}
            aria-label="Draw it"
          >
            {generating ? <Loader size={12} /> : <Palette size={13} />}
          </ActionIcon>
        </Group>
      )}

      <Textarea
        autosize
        minRows={minRows}
        maxRows={Math.max(5, minRows + 3)}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          // Enter sends, shift+enter breaks the line.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        variant="unstyled"
        disabled={thinking}
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
          {canAttach && (
            <>
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
              <Tooltip label="Draw a picture" withArrow>
                <ActionIcon
                  size="md"
                  radius="xl"
                  variant={drawing ? "filled" : "subtle"}
                  color={drawing ? "emerald" : "gray"}
                  disabled={thinking}
                  onClick={() => setDrawing((v) => !v)}
                  aria-label="Draw a picture"
                >
                  <Palette size={16} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>

        <ActionIcon
          size="md"
          radius="xl"
          color="emerald"
          variant="filled"
          loading={thinking}
          disabled={!value.trim()}
          onClick={onSend}
          aria-label="Send to Orbit"
        >
          <ArrowUp size={16} />
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
