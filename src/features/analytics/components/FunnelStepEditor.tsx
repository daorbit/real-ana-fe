import { Button } from "@mantine/core";
import { Plus, Play, Bookmark } from "lucide-react";
import { FunnelStepRow } from "@/features/analytics/components/funnel/FunnelStepRow";
import classes from "@/features/analytics/components/funnel/Funnel.module.css";

export type Draft = { type: "page" | "event"; value: string };

const MIN_STEPS = 2;
const MAX_STEPS = 8;

export function FunnelStepEditor({
  steps,
  pageOptions,
  eventOptions,
  valid,
  isLoading,
  editingId,
  onStepChange,
  onAddStep,
  onRemoveStep,
  onSave,
  onCompute,
}: {
  steps: Draft[];
  pageOptions: { value: string; label: string }[];
  eventOptions: { value: string; label: string }[];
  valid: boolean;
  isLoading: boolean;
  editingId: string | null;
  onStepChange: (i: number, patch: Partial<Draft>) => void;
  onAddStep: () => void;
  onRemoveStep: (i: number) => void;
  onSave: () => void;
  onCompute: () => void;
}) {
  const filled = steps.filter((s) => s.value).length;

  return (
    <section className={`${classes.panel} ${classes.editor}`} aria-labelledby="funnel-editor-title">
      <header className={classes.head}>
        <div className={classes.headText}>
          <h3 id="funnel-editor-title" className={classes.title}>Funnel steps</h3>
          <p className={classes.subtitle}>Sessions are counted only when they hit each step in this order.</p>
        </div>
      </header>

      <ol className={classes.steps}>
        {steps.map((s, i) => (
          <FunnelStepRow
            key={i}
            index={i}
            step={s}
            pageOptions={pageOptions}
            eventOptions={eventOptions}
            removable={steps.length > MIN_STEPS}
            onChange={(patch) => onStepChange(i, patch)}
            onRemove={() => onRemoveStep(i)}
          />
        ))}
      </ol>

      <button type="button" className={classes.addStep} onClick={onAddStep} disabled={steps.length >= MAX_STEPS}>
        <span className={classes.addMarker}>
          <Plus size={14} />
        </span>
        {steps.length >= MAX_STEPS ? `Up to ${MAX_STEPS} steps` : "Add step"}
      </button>

      <footer className={classes.footer}>
        <span className={classes.hint}>
          {valid ? `${filled} of ${steps.length} steps ready` : `Pick at least ${MIN_STEPS} steps to compute`}
        </span>
        <div className={classes.actions}>
          <Button variant="default" radius="xl" leftSection={<Bookmark size={14} />} onClick={onSave} disabled={!valid}>
            {editingId ? "Update" : "Save"}
          </Button>
          <Button radius="xl" leftSection={<Play size={14} />} onClick={onCompute} disabled={!valid} loading={isLoading}>
            Compute
          </Button>
        </div>
      </footer>
    </section>
  );
}
