import { useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Button, Divider, Group, Modal, RingProgress, ScrollArea,
  Text, TextInput, Tooltip,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, Check, Monitor, Smartphone, X } from "lucide-react";
import {
  CaptionEditor, CaptionToolbar, countHashtags,
  type CaptionEditorHandle,
} from "@/shared/components/CaptionEditor";
import { LinkedInPreview } from "./LinkedInPreview";
import { PostImageField } from "./PostImageField";
import { ScheduleFields } from "./ScheduleFields";
import { MAX_CAPTION, MAX_HASHTAGS, describe, type Draft } from "./draft";
import type { ScheduledPost } from "@/shared/types";

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
 * The same component creates and edits: the fields are identical, and one
 * surface means an existing post is corrected where it was written.
 */

/**
 * A labelled block in the composer column.
 *
 * `mb={10}` between label and field, `mb="xl"` between one field and the next:
 * a label sitting almost flush against its own input read as cramped, and with
 * too little space below a field the label underneath it looked like it
 * belonged to the field above.
 */
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
    <Box mb="xl">
      <Group justify="space-between" align="baseline" mb={10} wrap="nowrap">
        <Text size="sm" fw={600}>{label}</Text>
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
      </Group>
      {children}
    </Box>
  );
}

/** The two-stage split: what gets written, then when it goes out. */
const STEPS = [
  { id: "content" as const, label: "Write" },
  { id: "schedule" as const, label: "Schedule" },
];

type Step = (typeof STEPS)[number]["id"];

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
   *
   * `asDraft` saves it paused, so it keeps its date and time but publishes
   * nothing until it is resumed.
   */
  onSave: (draft: Draft, asDraft?: boolean) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  // What the post is about, in the author's own words. Kept out of the draft:
  // it is the instruction that produced the caption, not part of the post.
  const [topic, setTopic] = useState("");
  const [writeCaption, { isLoading: writing }] = useWriteShareCaptionMutation();
  // Content first, always: nobody arrives at this modal already knowing when
  // they want to post before they have written what they are posting.
  const [step, setStep] = useState<Step>("content");
  const editor = useRef<CaptionEditorHandle | null>(null);

  // Seed from `initial` on open, so editing an existing post loads it and a new
  // one starts blank — without wiping what is being typed on every re-render.
  useEffect(() => {
    if (opened) {
      setDraft(initial);
      setStep("content");
    }
  }, [opened, initial]);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));

  const chars = draft.caption.length;
  const tags = countHashtags(draft.caption);
  const overLimit = chars > MAX_CAPTION;
  const empty = !draft.caption.trim();
  // A one-off in the past would be refused by the server anyway; catching it
  // here keeps the message beside the field that caused it.
  const past = draft.mode === "once"
    && new Date(`${draft.date}T${draft.time}`).getTime() < Date.now();
  const blocked = empty || overLimit || past;

  const generate = async () => {
    if (!topic.trim() || !workspaceId) return;
    try {
      const res = await writeCaption({
        workspaceId,
        platform: "linkedin",
        topic: topic.trim(),
      }).unwrap();
      patch({ caption: res.caption });
    } catch (e) {
      notify.error(errMessage(e, "Orbit could not write that post."));
    }
  };

  const save = async (andAnother: boolean, asDraft = false) => {
    const ok = await onSave(draft, asDraft);
    if (!ok) return;
    if (andAnother) {
      // The cadence is the part people keep across a batch — only the content
      // changes from one post to the next.
      patch({ name: "", caption: "", image: "" });
      setStep("content");
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

            {/* The stepper doubles as a status: which stage is active, and
                that Write is a completed fact once Schedule is showing — a
                person landing back on this screen after switching tabs should
                not have to re-read the form to know where they left off. */}
            <Group gap={6} wrap="nowrap" ml="auto">
              {STEPS.map((s, i) => {
                const active = step === s.id;
                const done = STEPS.findIndex((x) => x.id === step) > i;
                return (
                  <Group key={s.id} gap={6} wrap="nowrap">
                    {i > 0 && (
                      <Box style={{ width: 20, height: 1, background: "var(--mantine-color-default-border)" }} />
                    )}
                    <Group
                      gap={6}
                      wrap="nowrap"
                      onClick={() => {
                        // Only Write is reachable by clicking back to it; a step
                        // ahead cannot be jumped to before the content behind it
                        // is valid, same as the Continue button enforces.
                        if (s.id === "content") setStep("content");
                      }}
                      style={{ cursor: s.id === "content" ? "pointer" : "default" }}
                    >
                      <Box
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          background: active || done ? "var(--accent)" : "var(--mantine-color-default)",
                          color: active || done ? "#fff" : "var(--mantine-color-dimmed)",
                          border: active || done ? "none" : "1px solid var(--mantine-color-default-border)",
                        }}
                      >
                        {done ? <Check size={12} /> : i + 1}
                      </Box>
                      <Text size="sm" fw={active ? 600 : 500} c={active ? undefined : "dimmed"}>
                        {s.label}
                      </Text>
                    </Group>
                  </Group>
                );
              })}
            </Group>
          </Group>

          <ScrollArea style={{ flex: 1 }} type="auto">
            <Box className="share-post-body">
              {step === "content" ? (
                <>
                  <Field label="Name" hint="For your own list. Not published.">
                    <TextInput
                      placeholder="Weekly analytics update"
                      value={draft.name}
                      onChange={(e) => patch({ name: e.currentTarget.value })}
                    />
                  </Field>

                  <Field label="Post" hint={`${tags}/${MAX_HASHTAGS} hashtags`}>
                    {/* Say what the post is about and Orbit drafts it. A topic
                        box rather than a bare "write for me" button: the post
                        goes out under the author's own name, so the model is
                        given their subject rather than left to guess one from
                        a workspace it cannot see. Writing over an existing
                        caption is deliberate — the button says "Rewrite" once
                        there is something to lose. */}
                    <Group gap="sm" mb="sm" wrap="nowrap" align="flex-end">
                      <TextInput
                        placeholder="What is this post about?"
                        value={topic}
                        onChange={(e) => setTopic(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && topic.trim() && !writing) {
                            e.preventDefault();
                            generate();
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      <Tooltip
                        label={
                          topic.trim()
                            ? "Orbit writes the post from this. Costs one Orbit question."
                            : "Say what the post is about first"
                        }
                        withArrow
                      >
                        <Box>
                          <Button
                            variant="light"
                            color="emerald"
                            loading={writing}
                            disabled={!topic.trim()}
                            onClick={generate}
                            leftSection={<PenLine size={15} />}
                          >
                            {draft.caption.trim() ? "Rewrite" : "Write with Orbit"}
                          </Button>
                        </Box>
                      </Tooltip>
                    </Group>

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
                        onChange={(caption) => patch({ caption })}
                        handleRef={editor}
                        ariaLabel="Post text"
                      />
                      {/* The counter sits inside the field rather than under it:
                          at 3000 characters the limit is far away most of the
                          time, and a ring shows how far without reading a
                          number. */}
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
                    <PostImageField value={draft.image} onChange={(image) => patch({ image })} />
                  </Field>
                </>
              ) : (
                <Field label="Schedule" hint={timezone}>
                  <ScheduleFields draft={draft} onChange={patch} timezone={timezone} />
                </Field>
              )}
            </Box>
          </ScrollArea>

          {/* Action bar, pinned so it stays reachable however long the post.
              Write moves forward only — the content has to exist before there
              is anything to schedule. Schedule can step back without losing
              what was written, since the draft lives above both steps. */}
          <Group
            justify="space-between"
            px={20}
            py="md"
            wrap="nowrap"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            {step === "content" ? (
              <>
                <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
                <Button rightSection={<ArrowRight size={15} />} disabled={empty || overLimit} onClick={() => setStep("schedule")}>
                  Continue to schedule
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<ArrowLeft size={15} />}
                  onClick={() => setStep("content")}
                >
                  Back
                </Button>
                <Group gap="sm" wrap="nowrap">
                  {/* Keeps the work without committing to publish it. The date
                      and time are still saved — a draft is a post on hold, not
                      a post with no schedule — so resuming it later needs one
                      click rather than picking a time again. */}
                  {!editing && (
                    <Tooltip label="Saves the post and its time, but publishes nothing until you resume it" withArrow>
                      <Button
                        variant="default"
                        loading={saving}
                        disabled={blocked}
                        onClick={() => save(false, true)}
                      >
                        Save as draft
                      </Button>
                    </Tooltip>
                  )}
                  {/* Composing a batch is the normal case here — someone sits
                      down and queues a month of posts. Closing after each one
                      would make that a dozen round trips through the list. */}
                  {!editing && (
                    <Button
                      variant="default"
                      loading={saving}
                      disabled={blocked}
                      onClick={() => save(true)}
                    >
                      Save & add another
                    </Button>
                  )}
                  <Button loading={saving} disabled={blocked} onClick={() => save(false)}>
                    {editing ? "Save changes" : "Create schedule"}
                  </Button>
                </Group>
              </>
            )}
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
                when={draft.mode === "once" ? describe(draft) : `${describe(draft)} · scheduled`}
                device={device}
              />
            </Box>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
