import { useState } from "react";
import { Button, Popover, TextInput, UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { LABEL_COLORS } from "../lib/labels";
import type { LabelColor, TaskLabel } from "../types";
import { LabelPill } from "./TaskBits";
import classes from "./Tasks.module.css";

const MAX_LABELS = 6;

export function LabelEditor({
  value,
  known,
  readOnly,
  onChange,
}: {
  value: TaskLabel[];
  known: TaskLabel[];
  readOnly: boolean;
  onChange: (labels: TaskLabel[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [color, setColor] = useState<LabelColor>("blue");
  const taken = new Set(value.map((l) => l.text.toLowerCase()));
  const suggestions = known.filter(
    (l) => !taken.has(l.text.toLowerCase()) && l.text.toLowerCase().includes(text.trim().toLowerCase()),
  );

  const add = (label: TaskLabel) => {
    if (taken.has(label.text.toLowerCase()) || value.length >= MAX_LABELS) return;
    onChange([...value, label]);
    setText("");
  };

  return (
    <div className={classes.labelEditor}>
      {value.map((label) => (
        <LabelPill
          key={label.text}
          label={label}
          onRemove={readOnly ? undefined : () => onChange(value.filter((l) => l.text !== label.text))}
        />
      ))}
      {!readOnly && value.length < MAX_LABELS && (
        <Popover opened={open} onChange={setOpen} position="bottom-start" width={270} trapFocus>
          <Popover.Target>
            <Button variant="subtle" color="gray" size="compact-sm" leftSection={<Plus size={14} />} onClick={() => setOpen((o) => !o)}>
              Add label
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <div className={classes.labelPicker}>
              <TextInput
                size="sm"
                placeholder="Label name"
                maxLength={24}
                value={text}
                data-autofocus
                onChange={(e) => setText(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && text.trim() && add({ text: text.trim(), color })}
              />
              <div className={classes.swatches}>
                {LABEL_COLORS.map((c) => (
                  <UnstyledButton
                    key={c}
                    className={classes.swatch}
                    data-color={c}
                    data-active={c === color || undefined}
                    onClick={() => setColor(c)}
                    aria-label={`${c} label`}
                  />
                ))}
              </div>
              {suggestions.length > 0 && (
                <div className={classes.labelSuggestions}>
                  {suggestions.slice(0, 10).map((l) => (
                    <UnstyledButton key={l.text} className={classes.labelSuggestion} onClick={() => add(l)}>
                      <LabelPill label={l} />
                    </UnstyledButton>
                  ))}
                </div>
              )}
              <Button size="compact-sm" disabled={!text.trim()} onClick={() => add({ text: text.trim(), color })}>
                Add “{text.trim() || "label"}”
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
    </div>
  );
}
