import { useCallback, useState } from "react";
import { Button, TextInput } from "@mantine/core";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { MAX_STEPS, MIN_STEPS, type Draft } from "../lib/funnelDraft";
import type { StepOptionGroup } from "../lib/funnelOptions";
import { FunnelStepField } from "./FunnelStepField";
import classes from "./Funnels.module.css";

export function FunnelForm({
  name,
  namePlaceholder,
  steps,
  groups,
  canSave,
  saving,
  saveLabel,
  cancelTo,
  onNameChange,
  onStepChange,
  onAddStep,
  onMoveStep,
  onRemoveStep,
  onSave,
}: {
  name: string;
  namePlaceholder: string;
  steps: Draft[];
  groups: StepOptionGroup[];
  canSave: boolean;
  saving: boolean;
  saveLabel: string;
  cancelTo: string;
  onNameChange: (name: string) => void;
  onStepChange: (index: number, step: Draft) => void;
  onAddStep: () => void;
  onMoveStep: (index: number, offset: -1 | 1) => void;
  onRemoveStep: (index: number) => void;
  onSave: () => void;
}) {
  const [pendingOpen, setPendingOpen] = useState<number | null>(null);
  const clearPending = useCallback(() => setPendingOpen(null), []);

  const add = () => {
    setPendingOpen(steps.length);
    onAddStep();
  };

  return (
    <form
      className={classes.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSave();
      }}
    >
      <div className={classes.formSection}>
        <TextInput
          label="Name"
          description="Shown in your funnel list. Leave it empty to use the first and last step."
          placeholder={namePlaceholder}
          value={name}
          maxLength={80}
          onChange={(e) => onNameChange(e.currentTarget.value)}
        />
      </div>

      <div className={classes.formSection}>
        <div className={classes.formLabelRow}>
          <span className={classes.formLabel}>Steps</span>
          <span className={classes.formHint}>In the order visitors take them. A session counts at a step only after every step before it.</span>
        </div>
        <ol className={classes.fields}>
          {steps.map((step, i) => (
            <FunnelStepField
              key={i}
              index={i}
              count={steps.length}
              step={step}
              groups={groups}
              removable={steps.length > MIN_STEPS}
              autoOpen={pendingOpen === i}
              onAutoOpened={clearPending}
              onChange={(next) => onStepChange(i, next)}
              onMove={(offset) => onMoveStep(i, offset)}
              onRemove={() => onRemoveStep(i)}
            />
          ))}
        </ol>
        <Button
          variant="default"
          leftSection={<Plus size={15} />}
          onClick={add}
          disabled={steps.length >= MAX_STEPS}
          className={classes.addStep}
        >
          {steps.length >= MAX_STEPS ? `Up to ${MAX_STEPS} steps` : "Add step"}
        </Button>
      </div>

      <div className={classes.formFooter}>
        <Button component={Link} to={cancelTo} variant="default">
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave} loading={saving}>
          {saveLabel}
        </Button>
      </div>
    </form>
  );
}
