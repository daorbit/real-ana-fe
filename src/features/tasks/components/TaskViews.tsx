import type { WorkspaceMember } from "@/shared/types";
import type { BoardView, Bucket, GroupBy, Task, TaskPatch } from "../types";
import { TaskBoard } from "./TaskBoard";
import { TaskGrid } from "./TaskGrid";
import { TaskCalendar } from "./calendar/TaskCalendar";
import { TaskTimeline } from "./timeline/TaskTimeline";
import { MyWork } from "./mine/MyWork";
import { TaskCharts } from "./charts/TaskCharts";

export type TaskViewsProps = {
  view: BoardView;
  visible: Task[];
  tasks: Task[];
  buckets: Bucket[];
  groupBy: GroupBy;
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  userId: string | null;
  canEdit: boolean;
  creating: boolean;
  addingBucket: boolean;
  onOpen: (task: Task) => void;
  onCreate: (title: string, patch: TaskPatch) => Promise<boolean>;
  onUpdate: (task: Task, patch: TaskPatch) => void;
  onToggleDone: (task: Task) => void;
  onAddBucket: (name: string) => Promise<boolean>;
  onRenameBucket: (bucket: Bucket, name: string) => void;
  onSetBucketLimit: (bucket: Bucket, limit: number | null) => void;
  onDeleteBucket: (bucket: Bucket) => void;
};

export function TaskViews(props: TaskViewsProps) {
  const { view, visible, tasks, buckets, members, memberMap, canEdit, onOpen, onUpdate, onToggleDone } = props;

  if (view === "board")
    return (
      <TaskBoard
        tasks={visible}
        allTasks={tasks}
        buckets={buckets}
        groupBy={props.groupBy}
        members={members}
        memberMap={memberMap}
        canEdit={canEdit}
        creating={props.creating}
        onCreate={props.onCreate}
        onOpen={onOpen}
        onMove={onUpdate}
        onToggleDone={onToggleDone}
        addingBucket={props.addingBucket}
        onAddBucket={props.onAddBucket}
        onRenameBucket={props.onRenameBucket}
        onSetBucketLimit={props.onSetBucketLimit}
        onDeleteBucket={props.onDeleteBucket}
      />
    );
  if (view === "grid")
    return <TaskGrid tasks={visible} buckets={buckets} members={memberMap} canEdit={canEdit} onOpen={onOpen} onToggleDone={onToggleDone} />;
  if (view === "calendar")
    return (
      <TaskCalendar
        tasks={visible}
        buckets={buckets}
        memberMap={memberMap}
        canEdit={canEdit}
        onOpen={onOpen}
        onToggleDone={onToggleDone}
        onMove={onUpdate}
      />
    );
  if (view === "timeline") return <TaskTimeline tasks={visible} buckets={buckets} onOpen={onOpen} />;
  if (view === "mine")
    return (
      <MyWork
        tasks={visible}
        buckets={buckets}
        memberMap={memberMap}
        userId={props.userId}
        canEdit={canEdit}
        onOpen={onOpen}
        onToggleDone={onToggleDone}
      />
    );
  return <TaskCharts tasks={visible} buckets={buckets} members={members} memberMap={memberMap} />;
}
