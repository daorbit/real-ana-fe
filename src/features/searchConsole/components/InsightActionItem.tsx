import { UnstyledButton } from "@mantine/core";
import { ChevronRight, Target, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { ActionKind, InsightAction } from "../insightActions";
import classes from "./insights.module.css";

const ICONS: Record<ActionKind, LucideIcon> = {
  opportunity: Target,
  declining: TrendingDown,
  growing: TrendingUp,
};

export function InsightActionItem({ action, onOpen }: { action: InsightAction; onOpen: () => void }) {
  const Icon = ICONS[action.kind];
  return (
    <UnstyledButton className={classes.action} data-kind={action.kind} onClick={onOpen}>
      <span className={classes.actionIcon}>
        <Icon size={16} />
      </span>
      <span className={classes.actionText}>
        <span className={classes.actionTitle}>{action.title}</span>
        <span className={classes.actionDetail}>{action.detail}</span>
      </span>
      <span className={classes.impact}>{action.impact}</span>
      <ChevronRight size={16} className={classes.actionChevron} />
    </UnstyledButton>
  );
}
