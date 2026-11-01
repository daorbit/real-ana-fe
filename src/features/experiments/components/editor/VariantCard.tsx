import { NumberInput, Text, TextInput } from "@mantine/core";
import type { ExperimentChange, ExperimentType, ExperimentVariant } from "@/features/experiments/types";
import { ChangeList } from "./ChangeList";
import classes from "../Experiments.module.css";

interface Props {
  index: number;
  type: ExperimentType;
  variant: ExperimentVariant;
  onChange: (patch: Partial<ExperimentVariant>) => void;
  onChangeEdit: (changeIndex: number, patch: Partial<ExperimentChange>) => void;
  onAddChange: () => void;
  onRemoveChange: (changeIndex: number) => void;
}

export function VariantCard({ index, type, variant, onChange, onChangeEdit, onAddChange, onRemoveChange }: Props) {
  const isOriginal = index === 0;

  return (
    <div className={classes.variant}>
      <div className={classes.variantHead}>
        <TextInput
          label={isOriginal ? "Original" : `Variant ${variant.key.toUpperCase()}`}
          maxLength={60}
          value={variant.name}
          onChange={(e) => onChange({ name: e.currentTarget.value })}
        />
        <NumberInput
          label="Share"
          suffix="%"
          min={1}
          max={99}
          clampBehavior="strict"
          allowDecimal={false}
          value={variant.weight}
          onChange={(value) => onChange({ weight: Number(value) || 0 })}
        />
      </div>

      {isOriginal && (
        <Text size="xs" c="dimmed">
          Visitors in this group see your page as it is today.
        </Text>
      )}

      {!isOriginal && type === "split" && (
        <TextInput
          label="Send these visitors to"
          placeholder="/pricing-new or https://example.com/pricing-new"
          maxLength={500}
          value={variant.redirectUrl}
          onChange={(e) => onChange({ redirectUrl: e.currentTarget.value.trim() })}
        />
      )}

      {!isOriginal && type === "changes" && (
        <ChangeList changes={variant.changes} onChange={onChangeEdit} onAdd={onAddChange} onRemove={onRemoveChange} />
      )}

      {!isOriginal && type === "code" && (
        <Text size="xs" c="dimmed">
          rta.variant() returns "{variant.key}" for visitors in this group.
        </Text>
      )}
    </div>
  );
}
