import { useState } from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import classes from "./List.module.css";

export function QuickInput({
  placeholder,
  busy = false,
  submitOnPaste = false,
  onSubmit,
}: {
  placeholder: string;
  busy?: boolean;
  submitOnPaste?: boolean;
  onSubmit: (text: string) => void | Promise<void>;
}) {
  const [value, setValue] = useState("");

  const submit = async (text: string) => {
    if (!text.trim()) return;
    setValue("");
    await onSubmit(text.trim());
  };

  return (
    <label className={classes.quick}>
      <input
        autoFocus
        className={classes.quickInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onPaste={(e) => {
          if (!submitOnPaste) return;
          const text = e.clipboardData.getData("text");
          if (!text) return;
          e.preventDefault();
          void submit(text);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          void submit(value);
        }}
      />
      <span className={classes.quickKey} aria-hidden>
        {busy ? <Loader2 size={13} className="spin" /> : <CornerDownLeft size={13} />}
      </span>
    </label>
  );
}
