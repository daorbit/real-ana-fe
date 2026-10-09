import { Tooltip, UnstyledButton } from "@mantine/core";
import { Maximize2, Minimize2, X } from "lucide-react";
import classes from "@/features/notes/components/Notes.module.css";

export function PanelControls({
  expanded,
  onToggleExpand,
  onClose,
}: {
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  return (
    <span className={classes.controls}>
      <Tooltip label={expanded ? "Shrink" : "Expand"} withArrow openDelay={400}>
        <UnstyledButton className={classes.ctrl} onClick={onToggleExpand} aria-label={expanded ? "Shrink notes" : "Expand notes"}>
          {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </UnstyledButton>
      </Tooltip>
      <Tooltip label="Close" withArrow openDelay={400}>
        <UnstyledButton className={classes.ctrl} onClick={onClose} aria-label="Close notes">
          <X size={14} />
        </UnstyledButton>
      </Tooltip>
    </span>
  );
}
