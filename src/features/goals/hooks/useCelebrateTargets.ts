import { useEffect } from "react";
import { celebrate } from "@/shared/lib/confetti";
import { notify } from "@/shared/lib/notify";
import type { TargetProgress } from "@/features/goals/types";

const PREFIX = "quantalog_goal_celebrated";

function markOnce(key: string): boolean {
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

export function useCelebrateTargets(targets: TargetProgress[] | undefined) {
  useEffect(() => {
    if (!targets?.length) return;
    const fresh = targets.filter(
      (t) => t.achieved && markOnce(`${PREFIX}:${t.id}:${t.periodKey}`)
    );
    if (fresh.length === 0) return;

    celebrate();
    notify.success(
      fresh.length === 1
        ? `You hit “${fresh[0].name}” for ${fresh[0].periodLabel}.`
        : `You hit ${fresh.length} goals this period.`,
      "Goal reached"
    );
  }, [targets]);
}
