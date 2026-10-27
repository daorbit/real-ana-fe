import { UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import { WorkspaceIcon } from "./WorkspaceIcon";
import classes from "./WorkspacePicker.module.css";

type Props = {
  name: string;
  icon?: WorkspaceIconData | null;
  lastUsed: boolean;
  picking: boolean;
  onClick: () => void;
};

export function WorkspaceTile({ name, icon, lastUsed, picking, onClick }: Props) {
  return (
    <UnstyledButton
      className={classes.tile}
      data-last={lastUsed || undefined}
      data-picking={picking || undefined}
      onClick={onClick}
      title={name}
    >
      <span className={classes.art}>
        <WorkspaceIcon icon={icon} />
      </span>
      <span className={classes.name}>{name}</span>
      <ChevronRight size={16} className={classes.chevron} aria-hidden />
    </UnstyledButton>
  );
}
