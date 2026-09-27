import type { ComponentProps } from "react";
import { Checkbox } from "@mantine/core";
import { ACCENT, StatCard } from "@/shared/ui/StatCard";
import classes from "./metrics.module.css";

export function SelectableStat({
  active,
  onSelect,
  ...card
}: ComponentProps<typeof StatCard> & { active: boolean; onSelect: () => void }) {
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={active}
      aria-label={card.label}
      className={classes.selectable}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <StatCard
        {...card}
        leading={
          <Checkbox
            size="xs"
            checked={active}
            readOnly
            tabIndex={-1}
            aria-hidden
            color={ACCENT[card.color ?? "emerald"] ?? ACCENT.emerald}
            className={classes.check}
          />
        }
      />
    </div>
  );
}
