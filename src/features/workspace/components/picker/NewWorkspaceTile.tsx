import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import classes from "./WorkspacePicker.module.css";

export function NewWorkspaceTile({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <UnstyledButton className={classes.tile} data-variant="add" onClick={onClick}>
      <span className={classes.art}>
        <Plus size={30} strokeWidth={1.6} />
      </span>
      <span className={classes.name}>{label}</span>
      <span className={classes.meta}>
        <span className={classes.role}>{hint}</span>
      </span>
    </UnstyledButton>
  );
}
