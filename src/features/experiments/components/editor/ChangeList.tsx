import { ActionIcon, Button, Select, TextInput, Textarea, Tooltip } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { ATTR_OPTIONS, CHANGE_ACTION_OPTIONS } from "@/features/experiments/lib/experimentLabels";
import type { ChangeAction, ExperimentChange } from "@/features/experiments/types";
import classes from "../Experiments.module.css";

const MAX_CHANGES = 20;

interface Props {
  changes: ExperimentChange[];
  onChange: (index: number, patch: Partial<ExperimentChange>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function valueLabel(change: ExperimentChange): string {
  if (change.action === "text") return "New text";
  if (change.action === "style") return "CSS, for example background: #16a34a; font-size: 20px";
  return "New value";
}

export function ChangeList({ changes, onChange, onAdd, onRemove }: Props) {
  return (
    <>
      {changes.map((change, i) => (
        <div key={i} className={classes.change}>
          <TextInput
            aria-label="CSS selector"
            placeholder="CSS selector, e.g. h1 or .cta-button"
            maxLength={300}
            value={change.selector}
            onChange={(e) => onChange(i, { selector: e.currentTarget.value })}
          />
          <Select
            aria-label="Change"
            data={CHANGE_ACTION_OPTIONS}
            value={change.action}
            allowDeselect={false}
            onChange={(value) => value && onChange(i, { action: value as ChangeAction, attr: value === "attr" ? "href" : "" })}
          />
          <Tooltip label="Remove change" withArrow>
            <ActionIcon variant="subtle" color="gray" onClick={() => onRemove(i)} disabled={changes.length === 1} aria-label="Remove change">
              <X size={15} />
            </ActionIcon>
          </Tooltip>
          {change.action === "attr" && (
            <Select
              className={classes.changeValue}
              aria-label="Attribute"
              data={ATTR_OPTIONS}
              value={change.attr || "href"}
              allowDeselect={false}
              onChange={(value) => value && onChange(i, { attr: value })}
            />
          )}
          {change.action !== "hide" && (
            <Textarea
              className={classes.changeValue}
              aria-label={valueLabel(change)}
              placeholder={valueLabel(change)}
              autosize
              minRows={1}
              maxRows={5}
              maxLength={2000}
              value={change.value}
              onChange={(e) => onChange(i, { value: e.currentTarget.value })}
            />
          )}
        </div>
      ))}
      {changes.length < MAX_CHANGES && (
        <div className={classes.addRow}>
          <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={onAdd}>
            Add a change
          </Button>
        </div>
      )}
    </>
  );
}
