import { useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Button, Divider, FileButton, Group, Modal, NumberInput,
  RingProgress, ScrollArea, SegmentedControl, Text, TextInput, Tooltip,
} from "@mantine/core";
import {
  CalendarClock, Image as ImageIcon, Monitor, Smartphone, Trash2, Upload, X,
} from "lucide-react";
import { notify } from "@/shared/lib/notify";
import {
  CaptionEditor, CaptionToolbar, countHashtags,
  type CaptionEditorHandle,
} from "@/shared/components/CaptionEditor";
import { LinkedInPreview } from "./LinkedInPreview";
import type { PostFrequency, ScheduledPost } from "@/shared/types";

/**
 * The scheduled-post composer.
 *
 * A full-screen split rather than a dialog, for the same reason the share panel
 * is one: someone writing a post that will go out under their own name, on
 * repeat, unattended, needs to see it as LinkedIn will render it — where the
 * caption folds, how the image crops — while they write. A stack of form fields
 * in a 600px box shows none of that, and the schedule is the one place where
 * nobody is watching when it publishes.
 *
 * The same component creates and edits: the fields are identical, and having
 * one surface means an existing post is corrected where it was written.
 */

export const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

const FREQUENCIES = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];

/** LinkedIn's commentary cap, and its hashtag guidance. */
export const MAX_CAPTION = 3000;
const MAX_HASHTAGS = 30;
const MAX_IMAGE_MB = 8;

/** Times people actually publish at, one click away from the number inputs. */
const QUICK_TIMES = [
  { label: "09:00", hour: 9, minute: 0 },
  { label: "12:00", hour: 12, minute: 0 },
  { label: "17:30", hour: 17, minute: 30 },
];

export type Draft = {
  name: string;
  caption: string;
  /** A data URL for a new upload, an https URL for one already stored, or "". */
  image: string;
  frequency: PostFrequency;
  hour: number;
  minute: number;
  weekday: number;
  dayOfMonth: number;
};

export function emptyDraft(): Draft {
  return {
    name: "",
    caption: "",
    image: "",
    frequency: "weekly",
    hour: 9,
    minute: 0,
    weekday: 1,
    dayOfMonth: 1,
  };
}

export function draftFromPost(post: ScheduledPost): Draft {
  return {
    name: post.name,
    caption: post.caption,
    image: post.imageUrl,
    frequency: post.frequency,
    hour: post.hour,
    minute: post.minute,
    weekday: post.weekday,
    dayOfMonth: post.dayOfMonth,
  };
}

/** "Every week on Monday at 09:00" — the cadence as a sentence. */
export function describe(post: Pick<Draft, "frequency" | "hour" | "minute" | "weekday" | "dayOfMonth">) {
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
}

/** Read a picked file as the base64 data URL the API expects. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read that file"));
    reader.readAsDataURL(file);
  });
}

/** A labelled block in the composer column. */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb="lg">
      <Group justify="space-between" align="baseline" mb={7} wrap="nowrap">
        <Text size="sm" fw={600}>{label}</Text>
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
      </Group>
      {children}
    </Box>
  );
}

export function PostComposer({
  opened,
  onClose,
  initial,
  /** The post being edited, or null when composing a new one. */
  editing,
  author,
  timezone,
  saving,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  initial: Draft;
  editing: ScheduledPost | null;
  author: string;
  timezone: string;
  saving: boolean;
  /**
   * Persist the draft. Resolves true when it saved, which is what decides
   * whether the composer closes or clears for the next post.
   */
  onSave: (draft: Draft) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [dragging, setDragging] = useState(false);
  const resetImage = useRef<() => void>(null);
  const editor = useRef<CaptionEditorHandle | null>(null);

  // Seed from `initial` on open, so editing an existing post loads it and a new
  // one starts blank — without wiping what is being typed on every re-render.
  useEffect(() => {
    if (opened) setDraft(initial);
  }, [opened, initial]);

  const chars = draft.caption.length;
  const tags = countHashtags(draft.caption);
  const overLimit = chars > MAX_CAPTION;
  const empty = !draft.caption.trim();

  const pickImage = async (file: File | null) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      notify.error("Images must be PNG, JPEG or WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      notify.error(`Image must be ${MAX_IMAGE_MB}MB or smaller.`);
      resetImage.current?.();
      return;
    }
    try {
      // Read first, then set: the updater passed to `setDraft` is synchronous.
      const dataUrl = await readAsDataUrl(file);
      setDraft((d) => ({ ...d, image: dataUrl }));
    } catch {
      notify.error("Could not read that image.");
    }
  };

  const save = async (andAnother: boolean) => {
    const ok = await onSave(draft);
    if (!ok) return;
    if (andAnother) {
      // The cadence is the part people keep across a batch — only the content
      // changes from one post to the next.
      setDraft((d) => ({ ...d, name: "", caption: "", image: "" }));
      resetImage.current?.();
      editor.current?.focus();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      styles={{
        content: { display: "flex", flexDirection: "column", border: "none" },
        body: { flex: 1, minHeight: 0, overflow: "hidden" },
      }}
    >
      <Group h="100%" gap={0} align="stretch" wrap="nowrap" className="share-post-shell">
        {/* ---- Composer ---- */}
        <Box className="share-post-composer">
          <Group gap="sm" px={20} py="md" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label="Close">
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>{editing ? "Edit scheduled post" : "New scheduled post"}</Text>
          </Group>

          <ScrollArea style={{ flex: 1 }} type="auto">
            <Box className="share-post-body">
              <Field label="Name" hint="For your own list. Not published.">
                <TextInput
                  placeholder="Weekly analytics update"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
                />
              </Field>

              <Field
                label="Post"
                hint={`${tags}/${MAX_HASHTAGS} hashtags`}
              >
                <Box
                  style={{
                    border: `1px solid ${overLimit ? "var(--mantine-color-red-5)" : "var(--mantine-color-default-border)"}`,
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <CaptionToolbar editor={editor} />
                  <CaptionEditor
                    value={draft.caption}
                    onChange={(caption) => setDraft((d) => ({ ...d, caption }))}
                    handleRef={editor}
                    ariaLabel="Post text"
                  />
                  {/* The counter sits inside the field rather than under it: at
                      3000 characters the limit is far away most of the time,
                      and a ring shows how far without reading a number. */}
                  <Group
                    justify="space-between"
                    align="center"
                    px={12}
                    py={6}
                    wrap="nowrap"
                    style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
                  >
                    <Text size="xs" c="dimmed">
                      Bold and italic are unicode characters — LinkedIn accepts no formatting.
                    </Text>
                    <Group gap={7} wrap="nowrap">
                      <Text size="xs" c={overLimit ? "red" : "dimmed"}>
                        {chars.toLocaleString()} / {MAX_CAPTION.toLocaleString()}
                      </Text>
                      <RingProgress
                        size={22}
                        thickness={3}
                        sections={[{
                          value: Math.min(100, (chars / MAX_CAPTION) * 100),
                          color: overLimit ? "red" : chars > MAX_CAPTION * 0.9 ? "orange" : "emerald",
                        }]}
                      />
                    </Group>
                  </Group>
                </Box>
              </Field>

              <Field label="Image" hint="Optional">
                {draft.image ? (
                  <Box
                    style={{
                      position: "relative",
                      borderRadius: "var(--mantine-radius-md)",
                      overflow: "hidden",
                      border: "1px solid var(--mantine-color-default-border)",
                    }}
                  >
                    <img src={draft.image} alt="" style={{ display: "block", width: "100%", maxHeight: 220, objectFit: "cover" }} />
                    <Group gap={6} style={{ position: "absolute", top: 8, right: 8 }}>
                      <FileButton resetRef={resetImage} accept="image/png,image/jpeg,image/webp" onChange={pickImage}>
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
                            setDraft({ ...draft, image: "" });
                            resetImage.current?.();
                          }}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Box>
                ) : (
                  <FileButton resetRef={resetImage} accept="image/png,image/jpeg,image/webp" onChange={pickImage}>
                    {(props) => (
                      <Box
                        {...props}
                        component="button"
                        type="button"
                        // Dropping a file is how people move an image from a
                        // folder into a post; the click target is the same box.
                        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e: React.DragEvent) => {
                          e.preventDefault();
                          setDragging(false);
                          pickImage(e.dataTransfer.files?.[0] ?? null);
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
                )}
              </Field>

              <Divider my="lg" />

              <Field label="Schedule" hint={timezone}>
                <SegmentedControl
                  fullWidth
                  data={FREQUENCIES}
                  value={draft.frequency}
                  onChange={(v) => setDraft({ ...draft, frequency: v as PostFrequency })}
                />

                {/* Only the field the chosen cadence uses is shown — a day
                    picker beside a daily schedule is a control that does
                    nothing. */}
                {draft.frequency === "weekly" && (
                  <Group gap={6} mt="sm" wrap="wrap">
                    {WEEKDAYS.map((d) => {
                      const on = String(draft.weekday) === d.value;
                      return (
                        <Button
                          key={d.value}
                          size="compact-sm"
                          radius="xl"
                          variant={on ? "filled" : "default"}
                          onClick={() => setDraft({ ...draft, weekday: Number(d.value) })}
                        >
                          {d.label.slice(0, 3)}
                        </Button>
                      );
                    })}
                  </Group>
                )}

                {draft.frequency === "monthly" && (
                  <NumberInput
                    mt="sm"
                    label="Day of month"
                    description="1–28, so every month has the day."
                    min={1}
                    max={28}
                    value={draft.dayOfMonth}
                    onChange={(v) => setDraft({ ...draft, dayOfMonth: Number(v) || 1 })}
                  />
                )}

                <Group mt="sm" gap="sm" align="flex-end" wrap="nowrap">
                  <NumberInput
                    label="Hour"
                    min={0}
                    max={23}
                    w={90}
                    value={draft.hour}
                    onChange={(v) => setDraft({ ...draft, hour: Math.min(23, Math.max(0, Number(v) || 0)) })}
                  />
                  <NumberInput
                    label="Minute"
                    min={0}
                    max={59}
                    step={5}
                    w={90}
                    value={draft.minute}
                    onChange={(v) => setDraft({ ...draft, minute: Math.min(59, Math.max(0, Number(v) || 0)) })}
                  />
                  <Group gap={6} wrap="nowrap" pb={2}>
                    {QUICK_TIMES.map((q) => (
                      <Button
                        key={q.label}
                        size="compact-sm"
                        radius="xl"
                        variant={draft.hour === q.hour && draft.minute === q.minute ? "filled" : "default"}
                        onClick={() => setDraft({ ...draft, hour: q.hour, minute: q.minute })}
                      >
                        {q.label}
                      </Button>
                    ))}
                  </Group>
                </Group>

                <Group gap={7} mt="sm" wrap="nowrap">
                  <CalendarClock size={14} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
                  <Text size="sm" c="dimmed">{describe(draft)} · {timezone}</Text>
                </Group>
              </Field>
            </Box>
          </ScrollArea>

          {/* Action bar, pinned so it stays reachable however long the post. */}
          <Group
            justify="space-between"
            px={20}
            py="md"
            wrap="nowrap"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
            <Group gap="sm" wrap="nowrap">
              {/* Composing a batch is the normal case here — someone sits down
                  and queues a month of posts. Closing after each one would make
                  that a dozen round trips through the list. */}
              {!editing && (
                <Button
                  variant="default"
                  loading={saving}
                  disabled={empty || overLimit}
                  onClick={() => save(true)}
                >
                  Save & add another
                </Button>
              )}
              <Button loading={saving} disabled={empty || overLimit} onClick={() => save(false)}>
                {editing ? "Save changes" : "Create schedule"}
              </Button>
            </Group>
          </Group>
        </Box>

        {/* ---- Preview ---- */}
        <Box className="share-post-preview">
          <Group justify="space-between" align="center" mb="xl" wrap="nowrap">
            <Text fw={700} size="lg">Preview</Text>
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
          </Group>

          <Box style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
            <Box w="100%">
              <LinkedInPreview
                author={author}
                headline="Publishing through Quantalog"
                caption={draft.caption}
                image={draft.image}
                when={describe(draft)}
                device={device}
              />
            </Box>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
