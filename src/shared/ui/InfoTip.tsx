import type { ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import classes from "./InfoTip.module.css";

const EVENTS = { hover: true, focus: true, touch: true };

export function InfoTip({ label, size = 13, width = 260 }: { label: string; size?: number; width?: number }) {
  return (
    <Tooltip label={label} multiline w={width} withArrow events={EVENTS}>
      <span className={classes.tip} tabIndex={0} role="img" aria-label={label}>
        <Info size={size} strokeWidth={2} />
      </span>
    </Tooltip>
  );
}

export function TipText({ label, children, width = 260 }: { label: string; children: ReactNode; width?: number }) {
  return (
    <Tooltip label={label} multiline w={width} withArrow events={EVENTS}>
      <span className={classes.text} tabIndex={0}>
        {children}
      </span>
    </Tooltip>
  );
}
