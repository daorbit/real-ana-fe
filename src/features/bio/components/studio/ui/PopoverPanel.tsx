import type { ReactElement, ReactNode } from "react";
import { Popover } from "@mantine/core";
import classes from "./List.module.css";

export function PopoverPanel({
  opened,
  onChange,
  target,
  width = 300,
  position = "bottom-end",
  children,
}: {
  opened: boolean;
  onChange: (opened: boolean) => void;
  target: ReactElement;
  width?: number;
  position?: "bottom-end" | "bottom-start" | "bottom";
  children: ReactNode;
}) {
  return (
    <Popover opened={opened} onChange={onChange} width={width} position={position} offset={6} shadow="md" radius={12} trapFocus withinPortal>
      <Popover.Target>{target}</Popover.Target>
      <Popover.Dropdown className={classes.popover}>{children}</Popover.Dropdown>
    </Popover>
  );
}
