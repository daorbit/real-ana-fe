import { CheckSquare } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { demoTasks } from "@/features/demo/demoTasks";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppOffCard } from "@/features/integrations/components/QuantalogAppOffCard";
import {
  HomeWidgetCard, WidgetEmpty, WidgetList, WidgetRow, WidgetStat, WidgetStats,
} from "@/shared/ui/HomeWidgetCard";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { useGetTasksQuery } from "@/features/tasks/api";
import { useMyTaskSummary } from "@/features/tasks/widgets/useMyTaskSummary";
import { dueLabel, dueState } from "@/features/tasks/lib/board";
import type { Task } from "@/features/tasks/types";

const NO_TASKS: Task[] = [];
const DEMO_USER = "demo-user-priya";
const SHOWN = 5;

export function MyTasksWidget({ workspaceId }: { workspaceId: string }) {
  const { tasks: on } = useWorkspaceApps();
  const { demo } = useDemo();
  const { user } = useAuth();
  const { currentData, isLoading } = useGetTasksQuery(workspaceId, { skip: !on || demo });
  const tasks = demo ? demoTasks : currentData?.tasks ?? NO_TASKS;
  const summary = useMyTaskSummary(tasks, demo ? DEMO_USER : user?.id ?? null);

  if (!on) return <QuantalogAppOffCard app="tasks" to="/app/tasks" />;

  return (
    <HomeWidgetCard icon={CheckSquare} title="My tasks" meta={`${summary.open} open`} to="/app/tasks">
      {isLoading && !demo ? (
        <ChartSkeleton height={140} />
      ) : (
        <>
          <WidgetStats>
            <WidgetStat label="Overdue" value={summary.overdue} tone={summary.overdue ? "bad" : undefined} />
            <WidgetStat label="Due today" value={summary.today} tone={summary.today ? "warn" : undefined} />
            <WidgetStat label="Next 7 days" value={summary.week} />
          </WidgetStats>
          {summary.next.length === 0 ? (
            <WidgetEmpty>Nothing assigned to you right now.</WidgetEmpty>
          ) : (
            <WidgetList>
              {summary.next.slice(0, SHOWN).map((task) => {
                const state = dueState(task.dueDate, task.status);
                return (
                  <WidgetRow
                    key={task.id}
                    title={task.title}
                    sub={`T-${task.key}${task.priority !== "none" ? ` · ${task.priority} priority` : ""}`}
                    end={task.dueDate ? dueLabel(task.dueDate, state) : "No date"}
                    endTone={state === "overdue" ? "bad" : undefined}
                  />
                );
              })}
            </WidgetList>
          )}
        </>
      )}
    </HomeWidgetCard>
  );
}
