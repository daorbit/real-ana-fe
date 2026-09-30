import type { TargetStatus } from "@/features/goals/types";
import classes from "@/features/goals/components/Goals.module.css";

export function TargetBar({
  progress,
  status,
  pace,
  size = "md",
}: {
  progress: number;
  status: TargetStatus;
  pace?: number | null;
  size?: "sm" | "md";
}) {
  const showPace = pace != null && status !== "achieved" && status !== "unavailable" && pace > 0.02 && pace < 0.98;

  return (
    <div
      className={classes.track}
      data-size={size}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={classes.fill} data-status={status} style={{ width: `${Math.max(progress * 100, progress > 0 ? 2 : 0)}%` }} />
      {showPace && <span className={classes.paceMark} style={{ left: `${pace * 100}%` }} />}
    </div>
  );
}
