import type { ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import type { Tone } from "./tone";
import classes from "./seoUi.module.css";

type LegacyTone = "good" | "warn" | "bad";

export function Tiles({ wide = false, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <div className={classes.tiles} data-wide={wide || undefined}>
      {children}
    </div>
  );
}

export function Tile({
  label,
  value,
  note,
  tone,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  note?: string;
  icon?: LucideIcon;
  color?: string;
  tone?: LegacyTone | Tone;
  hint?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className={classes.tileLabel}>{label}</span>
      <span className={classes.tileValue}>{value}</span>
      {note && <span className={classes.tileNote}>{note}</span>}
    </>
  );
  const body = onClick ? (
    <button type="button" className={classes.tile} data-tone={tone} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={classes.tile} data-tone={tone}>
      {inner}
    </div>
  );
  return hint ? (
    <Tooltip label={hint} withArrow multiline w={260}>
      {body}
    </Tooltip>
  ) : (
    body
  );
}
