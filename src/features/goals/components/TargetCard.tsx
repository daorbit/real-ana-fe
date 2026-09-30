import { ActionIcon, Loader, Menu } from "@mantine/core";
import { CalendarDays, Minus, MoreHorizontal, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressRing } from "@/features/goals/components/ProgressRing";
import { METRIC_MAP, STATUS_META, formatMetric, paceText, percentLabel, targetStatus } from "@/features/goals/metrics";
import { STATUS_TONES } from "@/features/goals/tones";
import type { TargetProgress } from "@/features/goals/types";
import classes from "@/features/goals/components/Goals.module.css";

const PACE_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function TargetCard({
  target,
  index,
  canEdit,
  deleting = false,
  onEdit,
  onDelete,
}: {
  target: TargetProgress;
  index: number;
  canEdit: boolean;
  deleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = METRIC_MAP[target.metric];
  const status = targetStatus(target);
  const pace = paceText(target);
  const Icon = meta.icon;
  const PaceIcon = PACE_ICON[pace.tone];
  const below = target.direction === "below";

  return (
    <motion.article
      className={classes.card}
      data-status={status}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-busy={deleting}
    >
      {deleting && (
        <div className={classes.busy}>
          <Loader size="sm" color="gray" />
          Deleting…
        </div>
      )}
      <div className={classes.cardHead}>
        <span className={classes.metricIcon}><Icon size={15} /></span>
        <span className={classes.cardEyebrow}>{meta.label}</span>
        <span className={classes.periodChip}>{target.period === "month" ? "Monthly" : "Quarterly"}</span>
        {canEdit && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" className={classes.menu} aria-label="Goal actions">
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>Edit goal</Menu.Item>
              <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      <div className={classes.cardMain}>
        <ProgressRing value={target.progress} tone={STATUS_TONES[status]} delay={0.1 + index * 0.05}>
          {target.status === "ok" ? (
            <>
              <span className={classes.pct}>{percentLabel(target)}</span>
              <span className={classes.pctLabel}>{below ? "of goal" : "done"}</span>
            </>
          ) : (
            <span className={classes.pctLabel}>Setup</span>
          )}
        </ProgressRing>

        <div className={classes.figures}>
          <span className={classes.name} title={target.name}>{target.name}</span>
          {target.status === "ok" ? (
            <>
              <span className={classes.current}>{formatMetric(target.metric, target.current ?? 0)}</span>
              <span className={classes.of}>
                {below ? "target ≤ " : "of "}
                {formatMetric(target.metric, target.target)} {meta.unit}
              </span>
            </>
          ) : (
            <span className={classes.reason}>{target.reason}</span>
          )}
        </div>
      </div>

      {target.status === "ok" && (
        <div className={classes.pace} data-tone={pace.tone}>
          <PaceIcon size={14} />
          {pace.text}
        </div>
      )}

      <div className={classes.cardFoot}>
        <span className={classes.status}>
          <span className={classes.dot} data-status={status} />
          {STATUS_META[status].label}
        </span>
        <span className={classes.days}>
          <CalendarDays size={13} />
          {target.periodLabel} · {target.daysLeft === 0 ? "ends today" : `${target.daysLeft}d left`}
        </span>
      </div>
    </motion.article>
  );
}
