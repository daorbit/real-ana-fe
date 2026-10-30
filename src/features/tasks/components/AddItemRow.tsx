import { useState } from "react";
import { TextInput } from "@mantine/core";
import { ProgressGlyph } from "./TaskBits";
import classes from "./Tasks.module.css";

export function AddItemRow({
  placeholder,
  ariaLabel,
  maxLength = 200,
  onAdd,
}: {
  placeholder: string;
  ariaLabel: string;
  maxLength?: number;
  onAdd: (text: string) => boolean | Promise<boolean>;
}) {
  const [text, setText] = useState("");

  const add = async () => {
    const value = text.trim();
    if (!value) return;
    if (await onAdd(value)) setText("");
  };

  return (
    <div className={classes.checkItem}>
      <span className={classes.progress} data-status="todo">
        <ProgressGlyph status="todo" size={18} />
      </span>
      <TextInput
        className={classes.checkAdd}
        classNames={{ input: classes.bareInput }}
        variant="unstyled"
        placeholder={placeholder}
        maxLength={maxLength}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && void add()}
        onBlur={() => void add()}
        aria-label={ariaLabel}
      />
    </div>
  );
}
