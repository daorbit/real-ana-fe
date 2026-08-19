import { useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Divider, Group, Modal, ScrollArea, Text,
} from "@mantine/core";
import { Monitor, Smartphone, X } from "lucide-react";
import { countHashtags, type CaptionEditorHandle } from "@/shared/components/CaptionEditor";
import { LinkedInPreview } from "./LinkedInPreview";
import { ComposerContentStep } from "./ComposerContentStep";
import { ComposerField } from "./ComposerField";
import { ComposerFooter } from "./ComposerFooter";
import { ComposerSteps, type Step } from "./ComposerSteps";
import { ScheduleFields } from "./ScheduleFields";
import { useOrbitCaption } from "../hooks/useOrbitCaption";
import { MAX_CAPTION, describe, type Draft } from "./draft";
import type { ScheduledPost } from "@/shared/types";

/**
 * The scheduled-post composer.
 *
 * A full-screen split rather than a dialog, for the same reason the share panel
 * is one: someone writing a post that will go out under their own name, on
 * repeat, unattended, needs to see it as LinkedIn will render it — where the
 * caption folds, how the image crops — while they write.
 *
 * Two steps, because writing a post and deciding when it goes out are separate
 * decisions and nobody makes the second one first. The same component creates
 * and edits: the fields are identical, and one surface means an existing post
 * is corrected where it was written.
 */
export function PostComposer({
  opened,
  onClose,
  initial,
  /** The post being edited, or null when composing a new one. */
  editing,
  author,
  timezone,
  saving,
  workspaceId,
  repeatingAllowed,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  initial: Draft;
  editing: ScheduledPost | null;
  author: string;
  timezone: string;
  saving: boolean;
  /** Whose Orbit allowance a generated post is billed against. */
  workspaceId: string | undefined;
  /** Whether this workspace's plan includes repeating posts. */
  repeatingAllowed?: boolean;
  /**
   * Persist the draft. Resolves true when it saved, which decides whether the
   * composer closes or clears for the next post. `asDraft` saves it paused, so
   * it keeps its date and time but publishes nothing until it is scheduled.
   */
  onSave: (draft: Draft, asDraft?: boolean) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  // Content first, always: nobody arrives already knowing when they want to
  // post before they have written what they are posting.
  const [step, setStep] = useState<Step>("content");
  /** Which footer button is mid-save, so only that one shows a spinner. */
  const [pending, setPending] = useState<"draft" | "another" | "save" | null>(null);
  const editor = useRef<CaptionEditorHandle | null>(null);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));

  const { topic, setTopic, generate, writing } = useOrbitCaption({
    workspaceId,
    onCaption: (caption) => patch({ caption }),
  });

  // Seed from `initial` on open, so editing an existing post loads it and a new
  // one starts blank — without wiping what is being typed on every re-render.
  useEffect(() => {
    if (opened) {
      setDraft(initial);
      setStep("content");
      setTopic("");
    }
    // `setTopic` is stable; re-running on it would reset the field mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initial]);

  const chars = draft.caption.length;
  const tags = countHashtags(draft.caption);
  const overLimit = chars > MAX_CAPTION;
  const empty = !draft.caption.trim();
  // A one-off in the past would be refused by the server anyway; catching it
  // here keeps the message beside the field that caused it.
  const past = draft.mode === "once"
    && new Date(`${draft.date}T${draft.time}`).getTime() < Date.now();
  const blocked = empty || overLimit || past;

  const save = async (andAnother: boolean, asDraft = false) => {
    // Which button was pressed, so only that one spins.
    setPending(asDraft ? "draft" : andAnother ? "another" : "save");
    const ok = await onSave(draft, asDraft);
    // Cleared on the way out either way: a failed save leaves the composer
    // open, and a button that kept spinning could never be pressed again.
    setPending(null);
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
          <Group gap="sm" px={20} py="md" wrap="nowrap" className="composer-header">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label="Close">
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>{editing ? "Edit scheduled post" : "New scheduled post"}</Text>
            <ComposerSteps step={step} onStep={setStep} />
          </Group>

          <ScrollArea style={{ flex: 1 }} type="auto">
            <Box className="share-post-body">
              {step === "content" ? (
                <ComposerContentStep
                  draft={draft}
                  patch={patch}
                  editor={editor}
                  topic={topic}
                  onTopic={setTopic}
                  onGenerate={generate}
                  writing={writing}
                  chars={chars}
                  tags={tags}
                  overLimit={overLimit}
                />
              ) : (
                <ComposerField label="Schedule" hint={timezone}>
                  <ScheduleFields
                    draft={draft}
                    onChange={patch}
                    timezone={timezone}
                    repeatingAllowed={repeatingAllowed}
                  />
                </ComposerField>
              )}
            </Box>
          </ScrollArea>

          <ComposerFooter
            step={step}
            editing={!!editing}
            blocked={blocked}
            canContinue={!empty && !overLimit}
            pending={pending}
            saving={saving}
            onClose={onClose}
            onStep={setStep}
            onSave={save}
          />
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
