import { UnstyledButton } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import classes from "./WorkspacePicker.module.css";

type Props = {
  icon: LucideIcon;
  name: string;
  meta?: string;
  variant?: "workspace" | "add";
  onClick: () => void;
};

export function WorkspaceTile({ icon: Icon, name, meta, variant = "workspace", onClick }: Props) {
  return (
    <UnstyledButton className={classes.tile} data-variant={variant} onClick={onClick}>
      <span className={classes.art}>
        <Icon size={variant === "add" ? 34 : 38} strokeWidth={1.6} />
      </span>
      <span className={classes.name}>{name}</span>
      {meta && <span className={classes.meta}>{meta}</span>}
    </UnstyledButton>
  );
}
