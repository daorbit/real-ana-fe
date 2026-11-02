import { useMemo } from "react";
import { CalendarCheck, UserRound } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { WorkspaceMember } from "@/shared/types";
import { bucketKeyOf } from "../../lib/board";
import { MY_WORK_GROUPS, myWork } from "../../lib/myWork";
import type { Bucket, Task } from "../../types";
import { TaskListGroup } from "../list/TaskListGroup";
import { TaskListRow } from "../list/TaskListRow";
import { ShippedRecap } from "../recap/ShippedRecap";
import { TaskTotalsTiles } from "../charts/TaskTotalsTiles";
import listClasses from "../list/TaskList.module.css";
import classes from "./MyWork.module.css";

export function MyWork({
  tasks,
  buckets,
  memberMap,
  userId,
  canEdit,
  onOpen,
  onToggleDone,
}: {
  tasks: Task[];
  buckets: Bucket[];
  memberMap: Map<string, WorkspaceMember>;
  userId: string | null;
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  const groups = useMemo(() => myWork(tasks, userId), [tasks, userId]);
  const mine = useMemo(() => [...groups.values()].flat(), [groups]);
  const open = mine.length;
  const bucketName = (task: Task) => buckets.find((b) => b.id === bucketKeyOf(task, buckets))?.name;

  if (!userId) return <EmptyState compact icon={UserRound} title="Sign in to see your work" description="Tasks assigned to you show up here." />;

  return (
    <div className={classes.page}>
      <header className={classes.head}>
        <span className={classes.title}>Assigned to you</span>
        <span className={classes.subtitle}>Grouped by when they are due.</span>
      </header>
      <TaskTotalsTiles tasks={mine} show={["open", "dueThisWeek", "overdue"]} />
      <ShippedRecap tasks={tasks} memberMap={memberMap} userId={userId} />
      {open === 0 ? (
        <EmptyState
          compact
          minHeight="30vh"
          icon={CalendarCheck}
          title="You're all caught up"
          description="Nothing assigned to you is open. Pick something from the board, or enjoy the quiet."
        />
      ) : (
        MY_WORK_GROUPS.map(({ key, title, empty }) => {
          const list = groups.get(key) ?? [];
          if (!list.length && !empty) return null;
          return (
            <TaskListGroup key={key} title={title} count={list.length} tone={key === "overdue" ? "danger" : undefined}>
              {list.length ? (
                list.map((task) => (
                  <TaskListRow
                    key={task.id}
                    task={task}
                    bucketName={bucketName(task)}
                    memberMap={memberMap}
                    canEdit={canEdit}
                    onOpen={onOpen}
                    onToggleDone={onToggleDone}
                  />
                ))
              ) : (
                <span className={listClasses.empty}>{empty}</span>
              )}
            </TaskListGroup>
          );
        })
      )}
    </div>
  );
}
