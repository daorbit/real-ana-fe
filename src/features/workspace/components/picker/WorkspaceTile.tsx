import { UnstyledButton } from "@mantine/core";
import { Check, ChevronRight } from "lucide-react";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import { WorkspaceIcon } from "./WorkspaceIcon";
import classes from "./WorkspacePicker.module.css";

type Props = {
  name: string;
  icon?: WorkspaceIconData | null;
  lastUsed: boolean;
  lastUsedLabel: string;
  picking: boolean;
  onClick: () => void;
};

export function WorkspaceTile({ name, icon, lastUsed, lastUsedLabel, picking, onClick }: Props) {
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
        {lastUsed && (
          <span className={classes.lastUsed}>
            <Check size={12} strokeWidth={2.4} />
            {lastUsedLabel}
          </span>
        )}
      </span>
      <span className={classes.name}>{name}</span>
      {lastUsed && <span className={classes.rowMeta}>{lastUsedLabel}</span>}
      <ChevronRight size={16} className={classes.chevron} aria-hidden />
    </UnstyledButton>
  );
}
