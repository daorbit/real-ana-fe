import { UnstyledButton } from "@mantine/core";
import { Undo2 } from "lucide-react";
import classes from "@/shared/ui/Toast.module.css";

export function UndoToast({ message, onUndo }: { message: string; onUndo: () => void }) {
  return (
    <span className={classes.undoRow}>
      <span>{message}</span>
      <UnstyledButton className={classes.undoButton} onClick={onUndo}>
        <Undo2 size={13} />
        Undo
      </UnstyledButton>
    </span>
  );
}
