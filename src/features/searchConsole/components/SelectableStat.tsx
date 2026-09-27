import type { ComponentProps, CSSProperties } from "react";
import { ACCENT, StatCard } from "@/shared/ui/StatCard";
import classes from "./metrics.module.css";

export function SelectableStat({
  active,
  onSelect,
  ...card
}: ComponentProps<typeof StatCard> & { active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={classes.selectable}
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onSelect}
      style={{ "--ring": ACCENT[card.color ?? "emerald"] ?? ACCENT.emerald } as CSSProperties}
    >
      <StatCard {...card} />
    </button>
  );
}
