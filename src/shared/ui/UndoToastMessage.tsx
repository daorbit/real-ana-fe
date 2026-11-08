import type { ReactNode } from "react";
import classes from "@/shared/ui/Toast.module.css";

export function UndoToastMessage({
  message,
  label,
  onUndo,
}: {
  message: ReactNode;
  label: string;
  onUndo: () => void;
}) {
  return (
    <span className={classes.undoRow}>
      <span>{message}</span>
      <button type="button" className={classes.undo} onClick={onUndo}>
        {label}
      </button>
    </span>
  );
}
