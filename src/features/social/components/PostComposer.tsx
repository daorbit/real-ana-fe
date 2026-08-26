import { useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Divider, Group, Modal, Text,
} from "@mantine/core";
import { X } from "lucide-react";
import { countHashtags, type CaptionEditorHandle } from "@/shared/components/CaptionEditor";
import { ComposerPreviewPane, type PaneTab } from "./ComposerPreviewPane";
import { ComposerPaneControls, type PreviewDevice } from "./ComposerPaneControls";
import { ComposerContentStep } from "./ComposerContentStep";
import { ComposerField } from "./ComposerField";
import { ComposerFooter } from "./ComposerFooter";
import { ComposerSteps, type Step } from "./ComposerSteps";
import { ScheduleFields } from "./ScheduleFields";
import { OrbitPlanPane } from "./orbit-plan/OrbitPlanPane";
import { useOrbitCaption } from "../hooks/useOrbitCaption";
import { useOrbitPlan } from "../hooks/useOrbitPlan";
import { DiscardDialog } from "./DiscardDialog";
import { captionLimit, isDirty, type Draft } from "./draft";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
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
  pane,
  onPane,
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
  /** Which side of the right pane is showing. Held in the URL by the page. */
  pane: PaneTab;
  onPane: (next: PaneTab) => void;
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
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [confirmingClose, setConfirmingClose] = useState(false);
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

  // Orbit asking for the post rather than being told it. Its answers land in
  // the same fields the author types into, so nothing it settles is hidden
  // from them — and nothing it settles is saved until a Schedule press.
  const planner = useOrbitPlan({ workspaceId, draft, onPlan: patch });

  // Seed from `initial` on open, so editing an existing post loads it and a new
  // one starts blank — without wiping what is being typed on every re-render.
  useEffect(() => {
    if (opened) {
      setDraft(initial);
      setStep("content");
      setTopic("");
      onPane("preview");
      // A new post starts a new conversation — carrying the last one over would
      // have Orbit answering about a post that is no longer on screen.
      planner.reset();
      setConfirmingClose(false);
    }
    // `setTopic` is stable; re-running on it would reset the field mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initial]);

  const chars = draft.caption.length;
  const tags = countHashtags(draft.caption);
  // The cap follows the network: Instagram's is 2200, LinkedIn's 3000.
  const limit = captionLimit(draft.provider);
  const overLimit = chars > limit;
  // A story publishes no text, so an empty caption is correct rather than
  // unfinished — what it cannot go out without is the image.
  const empty = draft.format !== "story" && !draft.caption.trim();
  // Instagram builds its post around a media container, so there is no
  // text-only post to publish. Blocked here rather than at save, so the reason
  // sits beside the image field instead of arriving as a toast.
  const needsImage = draft.provider === "instagram" && draft.images.length === 0;
  // A one-off in the past would be refused by the server anyway; catching it
  // here keeps the message beside the field that caused it.
  const past = draft.mode === "once"
    && new Date(`${draft.date}T${draft.time}`).getTime() < Date.now();
  const blocked = empty || overLimit || past || needsImage;

  // Closing is guarded only when something would actually be lost — a confirm
  // on an untouched form is one people learn to click through.
  const dirty = isDirty(draft, initial);
  const requestClose = () => (dirty ? setConfirmingClose(true) : onClose());
  const discard = () => {
    trace(user?.id, "discard_draft_confirmed", "composer", editing ? "post_unchanged" : "post_discarded");
    setConfirmingClose(false);
    onClose();
  };

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
      patch({ name: "", caption: "", images: [] });
      setStep("content");
      editor.current?.focus();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={requestClose}
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
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={requestClose} aria-label="Close">
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>{editing ? "Edit scheduled post" : "New scheduled post"}</Text>
            <ComposerSteps step={step} onStep={setStep} />
          </Group>

          {/* Native overflow, so this column carries the app's own thin
              scrollbar rather than Mantine's overlay one. */}
          <Box style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
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
                  limit={limit}
                  needsImage={needsImage}
                  // The network is fixed once a post exists: its caption and
                  // image were written against one set of rules, and switching
                  // would silently invalidate them.
                  lockProvider={!!editing}
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
          </Box>

          <ComposerFooter
            step={step}
            editing={!!editing}
            blocked={blocked}
            canContinue={!empty && !overLimit}
            pending={pending}
            saving={saving}
            onClose={requestClose}
            onStep={setStep}
            onSave={save}
          />
        </Box>

        <ComposerPreviewPane
          draft={draft}
          author={author}
          tab={pane}
          device={device}
          controls={
            <ComposerPaneControls
              tab={pane}
              onTab={onPane}
              device={device}
              onDevice={setDevice}
            />
          }
          orbit={
            <OrbitPlanPane
              draft={draft}
              onImages={(images) => patch({ images })}
              turns={planner.turns}
              input={planner.input}
              onInput={planner.setInput}
              onSend={planner.send}
              onRetry={planner.retry}
              thinking={planner.thinking}
              ready={planner.ready}
              awaitingImage={planner.awaitingImage}
              error={planner.error}
              onReset={planner.reset}
              // "Edit first" leaves the filled fields behind and returns to the
              // post, which is the point of filling them.
              onEdit={() => onPane("preview")}
              // Same save path as the footer, so one place decides what a valid
              // scheduled post is.
              onSchedule={() => void save(false)}
              scheduling={pending === "save"}
              blockedReason={
                needsImage ? "Add an image before scheduling — Instagram posts need one."
                  : overLimit ? "The caption is over the limit for this network."
                    : past ? "That time has already passed. Pick a later one."
                      : empty ? "There is no post to schedule yet."
                        : ""
              }
            />
          }
        />
      </Group>

      <DiscardDialog
        opened={confirmingClose}
        onKeep={() => setConfirmingClose(false)}
        onDiscard={discard}
        editing={!!editing}
      />
    </Modal>
  );
}
