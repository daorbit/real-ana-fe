import { CalendarDays, ChartGantt, ChartPie, CircleUserRound, Columns3, Table2 } from "lucide-react";
import type { BoardView, DueFilter, GroupBy } from "../types";

export const GROUPS: GroupBy[] = ["bucket", "progress", "assignee", "priority"];

export const DUE_FILTERS: { value: DueFilter; label: string }[] = [
  { value: "all", label: "Any due date" },
  { value: "overdue", label: "Overdue" },
  { value: "soon", label: "Due soon" },
];

export const VIEWS: { value: BoardView; label: string; icon: typeof Columns3 }[] = [
  { value: "board", label: "Board", icon: Columns3 },
  { value: "grid", label: "Grid", icon: Table2 },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
  { value: "timeline", label: "Timeline", icon: ChartGantt },
  { value: "mine", label: "My work", icon: CircleUserRound },
  { value: "charts", label: "Charts", icon: ChartPie },
];

export function dueFilterLabel(value: DueFilter): string {
  return DUE_FILTERS.find((item) => item.value === value)?.label ?? "Any due date";
}
