import { useState } from "react";
import { ActionIcon, Checkbox, TextInput, UnstyledButton } from "@mantine/core";
import { X } from "lucide-react";
import { newCheckId } from "../lib/labels";
import type { CheckItem } from "../types";
import { ProgressGlyph } from "./TaskBits";
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
            {done} / {items.length}
          </span>
        )}
        <span className={classes.sectionEnd}>
          <Checkbox
            size="xs"
            label="Show on card"
            checked={onCard}
            disabled={readOnly}
            onChange={(e) => onCardChange(e.currentTarget.checked)}
          />
        </span>
      </div>
      <div className={classes.checklist}>
        {items.map((item) => (
          <div key={item.id} className={classes.checkItem}>
            <UnstyledButton
              className={classes.progress}
              data-status={item.done ? "done" : "todo"}
              disabled={readOnly}
              onClick={() => onChange(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))}
              aria-label={item.done ? `Mark “${item.text}” not done` : `Mark “${item.text}” done`}
            >
              <ProgressGlyph status={item.done ? "done" : "todo"} size={18} />
            </UnstyledButton>
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
        {!readOnly && items.length < MAX_ITEMS && (
          <div className={classes.checkItem}>
            <span className={classes.progress} data-status="todo">
              <ProgressGlyph status="todo" size={18} />
            </span>
            <TextInput
              className={classes.checkAdd}
              classNames={{ input: classes.bareInput }}
              variant="unstyled"
              placeholder={items.length ? "Add an item" : "Add steps to complete this task. Mark them done as you go."}
              maxLength={200}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              onBlur={add}
              aria-label="Add a checklist item"
            />
          </div>
        )}
      </div>
    </section>
  );
}
