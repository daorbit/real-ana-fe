import { UnstyledButton } from "@mantine/core";
import { Check, FolderKanban } from "lucide-react";
import classes from "./WorkspacePicker.module.css";

type Props = {
  name: string;
  plan?: string;
  paid: boolean;
  role: string;
  shortcut?: number;
  lastUsed: boolean;
  lastUsedLabel: string;
  onClick: () => void;
};

export function WorkspaceTile({ name, plan, paid, role, shortcut, lastUsed, lastUsedLabel, onClick }: Props) {
  return (
    <UnstyledButton
      className={classes.tile}
      data-last={lastUsed || undefined}
      onClick={onClick}
      title={name}
      autoFocus={lastUsed}
    >
      <span className={classes.art}>
        <span className={classes.iconWell}>
          <FolderKanban size={30} strokeWidth={1.6} />
        </span>
        {shortcut !== undefined && <kbd className={classes.key}>{shortcut}</kbd>}
        {lastUsed && (
          <span className={classes.lastUsed}>
            <Check size={12} strokeWidth={2.4} />
            {lastUsedLabel}
          </span>
        )}
      </span>
      <span className={classes.name}>{name}</span>
      <span className={classes.meta}>
        {plan && (
          <span className={classes.plan} data-paid={paid || undefined}>
            {plan}
          </span>
        )}
        <span className={classes.role}>{role}</span>
      </span>
    </UnstyledButton>
  );
}
