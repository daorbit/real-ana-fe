import { useState } from "react";
import { ActionIcon, Checkbox, Progress, Switch, TextInput } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { newCheckId } from "../lib/labels";
import type { CheckItem } from "../types";
import classes from "./Tasks.module.css";

const MAX_ITEMS = 30;

export function ChecklistEditor({
  items,
  onCard,
  readOnly,
  onChange,
  onCardChange,
}: {
  items: CheckItem[];
  onCard: boolean;
  readOnly: boolean;
  onChange: (items: CheckItem[]) => void;
  onCardChange: (value: boolean) => void;
}) {
  const [text, setText] = useState("");
  const done = items.filter((i) => i.done).length;

  const add = () => {
    const value = text.trim();
    if (!value || items.length >= MAX_ITEMS) return;
    onChange([...items, { id: newCheckId(), text: value, done: false }]);
    setText("");
  };

  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <span className={classes.sectionTitle}>Checklist</span>
        {items.length > 0 && (
          <span className={classes.sectionMeta}>
            {done}/{items.length}
          </span>
        )}
        <span className={classes.sectionEnd}>
          <Switch
            size="xs"
            label="Show on card"
            checked={onCard}
            disabled={readOnly}
            onChange={(e) => onCardChange(e.currentTarget.checked)}
          />
        </span>
      </div>
      {items.length > 0 && <Progress value={(done / items.length) * 100} size={4} radius="xl" color="var(--green)" aria-label="Checklist progress" />}
      <div>
        {items.map((item) => (
          <div key={item.id} className={classes.checkItem}>
            <Checkbox
              size="sm"
              radius="xl"
              color="var(--green)"
              checked={item.done}
              disabled={readOnly}
              onChange={(e) => onChange(items.map((i) => (i.id === item.id ? { ...i, done: e.currentTarget.checked } : i)))}
              aria-label={item.text}
            />
            <span className={classes.checkText} data-done={item.done || undefined}>
              {item.text}
            </span>
            {!readOnly && (
              <ActionIcon
                className={classes.checkRemove}
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                aria-label={`Remove ${item.text}`}
              >
                <X size={14} />
              </ActionIcon>
            )}
          </div>
        ))}
      </div>
      {!readOnly && items.length < MAX_ITEMS && (
        <TextInput
          size="sm"
          variant="unstyled"
          leftSection={<Plus size={15} />}
          placeholder="Add an item"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          onBlur={add}
          aria-label="Add a checklist item"
        />
      )}
    </section>
  );
}
