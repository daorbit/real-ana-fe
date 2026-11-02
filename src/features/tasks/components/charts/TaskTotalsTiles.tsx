import { useMemo } from "react";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import { taskTotals, type TaskTotals } from "../../lib/charts";
import type { Task } from "../../types";

type TotalKey = keyof TaskTotals;

const TILES: Record<TotalKey, { label: string; note: (n: number) => string }> = {
  open: { label: "Open", note: () => "Not started or in progress" },
  inProgress: { label: "In progress", note: () => "Being worked on now" },
  dueThisWeek: { label: "Due this week", note: () => "Open, due in the next 7 days" },
  overdue: { label: "Overdue", note: (n) => (n ? "Past their due date" : "Nothing is late") },
};

export function TaskTotalsTiles({ tasks, show }: { tasks: Task[]; show: TotalKey[] }) {
  const totals = useMemo(() => taskTotals(tasks), [tasks]);
  return (
    <StatTileGrid>
      {show.map((key) => (
        <StatTile key={key} label={TILES[key].label} value={String(totals[key])} note={TILES[key].note(totals[key])} />
      ))}
    </StatTileGrid>
  );
}
