import { useMemo } from "react";
import { MY_WORK_GROUPS, myWork } from "@/features/tasks/lib/myWork";
import type { Task } from "@/features/tasks/types";

export function useMyTaskSummary(tasks: Task[], userId: string | null) {
  return useMemo(() => {
    const groups = myWork(tasks, userId);
    const count = (key: (typeof MY_WORK_GROUPS)[number]["key"]) => groups.get(key)?.length ?? 0;
    const next = MY_WORK_GROUPS.flatMap((g) => groups.get(g.key) ?? []);
    return {
      open: next.length,
      overdue: count("overdue"),
      today: count("today"),
      week: count("week"),
      next,
    };
  }, [tasks, userId]);
}
