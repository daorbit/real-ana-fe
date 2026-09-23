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
import { useOrbitPlan } from "../hooks/useOrbitPlan";
import { DiscardDialog } from "./DiscardDialog";
import { captionLimit, isDirty, type Draft } from "./draft";

const DRAFT_KEY = (workspaceId: string | undefined) =>
  `quantalog_post_draft_${workspaceId ?? "none"}`;
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { ScheduledPost } from "@/shared/types";

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
  
  
  const [step, setStep] = useState<Step>("content");
  /** Which footer button is mid-save, so only that one shows a spinner. */
  const [pending, setPending] = useState<"draft" | "another" | "save" | null>(null);
  const editor = useRef<CaptionEditorHandle | null>(null);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));

  const addImage = (url: string) =>
    setDraft((d) => (d.images.includes(url) ? d : { ...d, images: [...d.images, url] }));

  
  
  
  const planner = useOrbitPlan({ workspaceId, draft, onPlan: patch, onAddImage: addImage });

  useEffect(() => {
    if (opened) {

      let seed = initial;
      if (!editing) {
        try {
          const raw = sessionStorage.getItem(DRAFT_KEY(workspaceId));
          if (raw) seed = { ...initial, ...(JSON.parse(raw) as Partial<Draft>) };
        } catch {
         
        }
      }
      setDraft(seed);
      setStep("content");
      onPane("preview");

      planner.reset();
      setConfirmingClose(false);
    }
    
  }, [opened, initial]);

  const chars = draft.caption.length;
  const tags = countHashtags(draft.caption);
  
  const limit = captionLimit(draft.provider);
  const overLimit = chars > limit;
  
  
  const empty = draft.format !== "story" && !draft.caption.trim();

  const needsImage = draft.provider === "instagram" && draft.images.length === 0;
  
  
  const past = draft.mode === "once"
    && new Date(`${draft.date}T${draft.time}`).getTime() < Date.now();
  const blocked = empty || overLimit || past || needsImage;

  
  
  const dirty = isDirty(draft, initial);
  const requestClose = () => (dirty ? setConfirmingClose(true) : onClose());

  const clearStash = () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY(workspaceId));
    } catch {
     
    }
  };

  
  
  useEffect(() => {
    if (editing || !opened) return;
    if (!dirty) {
      clearStash();
      return;
    }
    try {
      sessionStorage.setItem(DRAFT_KEY(workspaceId), JSON.stringify(draft));
    } catch {
     
    }
    
  }, [draft, dirty, editing, opened, workspaceId]);

  const discard = () => {
    trace(user?.id, "discard_draft_confirmed", "composer", editing ? "post_unchanged" : "post_discarded");
    clearStash();
    setConfirmingClose(false);
    onClose();
  };

  const save = async (andAnother: boolean, asDraft = false) => {
    
    setPending(asDraft ? "draft" : andAnother ? "another" : "save");
    const ok = await onSave(draft, asDraft);
    
    
    setPending(null);
    if (!ok) return;
    clearStash();
    if (andAnother) {
      
      
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
                  chars={chars}
                  tags={tags}
                  overLimit={overLimit}
                  limit={limit}
                  needsImage={needsImage}
                  
                  
                  
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
              workspaceId={workspaceId}
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
              onSendImage={planner.sendImage}
              onApproveImage={planner.approveImage}
              generatingImage={planner.generatingImage}
              onApproveCaption={planner.approveCaption}
              
              
              onEdit={() => onPane("preview")}
              
              
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
