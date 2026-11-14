import type { Ref } from "react";
import { Pencil } from "lucide-react";
import classes from "./InlineField.module.css";

export function InlineField({
  value,
  placeholder,
  label,
  tone = "body",
  maxLength,
  missing = false,
  inputRef,
  inputMode,
  onChange,
  onEnter,
}: {
  value: string;
  placeholder: string;
  label: string;
  tone?: "title" | "body" | "sub" | "strong";
  maxLength?: number;
  missing?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  inputMode?: "url" | "text";
  onChange: (value: string) => void;
  onEnter?: () => void;
}) {
  return (
    <span className={classes.wrap} data-tone={tone}>
      <input
        ref={inputRef}
        className={classes.input}
        aria-label={label}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        data-missing={missing || undefined}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (onEnter) onEnter();
            else e.currentTarget.blur();
          }
          if (e.key === "Escape") e.currentTarget.blur();
        }}
      />
      <Pencil size={13} className={classes.pencil} aria-hidden />
    </span>
  );
}
