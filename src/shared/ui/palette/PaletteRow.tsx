import { Text, UnstyledButton } from "@mantine/core";
import { CornerDownLeft } from "lucide-react";
import { KeyCaps } from "@/shared/ui/palette/KeyCaps";
import type { PaletteCommand } from "@/shared/ui/palette/types";
import classes from "@/shared/ui/palette/Palette.module.css";

export function PaletteRow({
  command,
  index,
  active,
  onHover,
  onRun,
}: {
  command: PaletteCommand;
  index: number;
  active: boolean;
  onHover: (index: number) => void;
  onRun: (command: PaletteCommand) => void;
}) {
  const Icon = command.icon;
  return (
    <UnstyledButton
      className="cmdk-item"
      data-index={index}
      data-active={active}
      onMouseMove={() => onHover(index)}
      onClick={() => onRun(command)}
    >
      <Icon size={16} className={classes.rowIcon} />
      <Text size="sm" truncate>{command.label}</Text>
      {command.hint && !command.keys && <span className={`cmdk-item__hint ${classes.hint}`}>{command.hint}</span>}
      {command.keys && <KeyCaps keys={command.keys} then={command.keys[0] === "G"} />}
      {active && <CornerDownLeft size={13} className={classes.enter} />}
    </UnstyledButton>
  );
}
