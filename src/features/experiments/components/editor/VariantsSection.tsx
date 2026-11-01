import { Button, Group } from "@mantine/core";
import { Plus, Scale } from "lucide-react";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import { MAX_VARIANTS, totalWeight } from "@/features/experiments/lib/experimentDraft";
import type { ExperimentChange, ExperimentInput, ExperimentVariant } from "@/features/experiments/types";
import { VariantCard } from "./VariantCard";
import classes from "../Experiments.module.css";

interface Props {
  draft: ExperimentInput;
  onVariant: (index: number, patch: Partial<ExperimentVariant>) => void;
  onChange: (index: number, changeIndex: number, patch: Partial<ExperimentChange>) => void;
  onAddChange: (index: number) => void;
  onRemoveChange: (index: number, changeIndex: number) => void;
  onCount: (count: number) => void;
}

export function VariantsSection({ draft, onVariant, onChange, onAddChange, onRemoveChange, onCount }: Props) {
  const total = totalWeight(draft.variants);
  const count = draft.variants.length;

  return (
    <StudioSection step={4} title="Variants" description="The original plus up to three versions to compare. Each visitor keeps the same one." done={total === 100}>
      {draft.variants.map((variant, i) => (
        <VariantCard
          key={variant.key}
          index={i}
          type={draft.type}
          variant={variant}
          onChange={(patch) => onVariant(i, patch)}
          onChangeEdit={(changeIndex, patch) => onChange(i, changeIndex, patch)}
          onAddChange={() => onAddChange(i)}
          onRemoveChange={(changeIndex) => onRemoveChange(i, changeIndex)}
        />
      ))}
      <Group justify="space-between">
        <span className={classes.weightNote} data-off={total !== 100 || undefined}>
          Shares add up to {total}%{total === 100 ? "" : ", they need to make 100%"}
        </span>
        <Group gap="xs">
          <Button variant="subtle" size="xs" leftSection={<Scale size={14} />} onClick={() => onCount(count)}>
            Split evenly
          </Button>
          {count < MAX_VARIANTS && (
            <Button variant="default" size="xs" leftSection={<Plus size={14} />} onClick={() => onCount(count + 1)}>
              Add variant
            </Button>
          )}
          {count > 2 && (
            <Button variant="subtle" color="gray" size="xs" onClick={() => onCount(count - 1)}>
              Remove last
            </Button>
          )}
        </Group>
      </Group>
    </StudioSection>
  );
}
