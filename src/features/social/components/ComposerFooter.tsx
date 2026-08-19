import { Button, Group, Tooltip } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Step } from "./ComposerSteps";

/**
 * The composer's action bar, pinned so it stays reachable however long the post.
 *
 * Write moves forward only — the content has to exist before there is anything
 * to schedule. Schedule can step back without losing what was written, since
 * the draft lives above both steps.
 */
export function ComposerFooter({
  step,
  editing,
  blocked,
  canContinue,
  pending,
  saving,
  onClose,
  onStep,
  onSave,
}: {
  step: Step;
  /** True when correcting an existing post rather than writing a new one. */
  editing: boolean;
  /** Nothing can be saved yet — empty, over the limit, or scheduled in the past. */
  blocked: boolean;
  /** Enough is written to move on, even if the schedule is not settled. */
  canContinue: boolean;
  /** Which button is mid-save, so only that one spins. */
  pending: "draft" | "another" | "save" | null;
  /** Any save in flight, which disables the others. */
  saving: boolean;
  onClose: () => void;
  onStep: (step: Step) => void;
  onSave: (andAnother: boolean, asDraft?: boolean) => void;
}) {
  if (step === "content") {
    return (
      <Group justify="space-between" className="composer-footer" wrap="nowrap">
        <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
        <Button
          rightSection={<ArrowRight size={15} />}
          disabled={!canContinue}
          onClick={() => onStep("schedule")}
        >
          Continue to schedule
        </Button>
      </Group>
    );
  }

  return (
    <Group justify="space-between" className="composer-footer" wrap="nowrap">
      <Button
        variant="subtle"
        color="gray"
        leftSection={<ArrowLeft size={15} />}
        onClick={() => onStep("content")}
      >
        Back
      </Button>

      <Group gap="sm" wrap="nowrap">
        {/* Keeps the work without committing to publish it. The date and time
            are still saved — a draft is a post on hold, not a post with no
            schedule — so scheduling it later is one click, not a re-pick. */}
        {!editing && (
          <Tooltip label="Saves the post and its time, but publishes nothing until you schedule it" withArrow>
            <Button
              variant="default"
              loading={pending === "draft"}
              disabled={blocked || saving}
              onClick={() => onSave(false, true)}
            >
              Save as draft
            </Button>
          </Tooltip>
        )}
        {/* Composing a batch is the normal case — someone sits down and queues
            a month of posts. Closing after each one would make that a dozen
            round trips through the list. */}
        {!editing && (
          <Button
            variant="default"
            loading={pending === "another"}
            disabled={blocked || saving}
            onClick={() => onSave(true)}
          >
            Save & add another
          </Button>
        )}
        <Button
          loading={pending === "save"}
          disabled={blocked || saving}
          onClick={() => onSave(false)}
        >
          {editing ? "Save changes" : "Create schedule"}
        </Button>
      </Group>
    </Group>
  );
}
