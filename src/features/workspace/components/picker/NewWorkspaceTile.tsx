import { UnstyledButton } from "@mantine/core";
import { ChevronRight, Plus } from "lucide-react";
import classes from "./WorkspacePicker.module.css";

export function NewWorkspaceTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <UnstyledButton className={classes.tile} data-variant="add" onClick={onClick}>
      <span className={classes.art}>
        <Plus size={30} strokeWidth={1.6} />
      </span>
      <span className={classes.name}>{label}</span>
      <ChevronRight size={16} className={classes.chevron} aria-hidden />
    </UnstyledButton>
  );
}
