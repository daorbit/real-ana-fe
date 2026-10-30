export type TaskStatus = "todo" | "doing" | "done";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export type LabelColor = "blue" | "green" | "amber" | "red" | "violet" | "pink" | "teal" | "gray";

export type TaskLabel = { text: string; color: LabelColor };

export type CheckItem = { id: string; text: string; done: boolean };

export type Task = {
  id: string;
  key: number;
  bucketId: string | null;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  startDate: string | null;
  dueDate: string | null;
  parentId: string | null;
  blockedBy: string[];
  order: number;
  link: string;
  labels: TaskLabel[];
  checklist: CheckItem[];
  checklistOnCard: boolean;
  createdBy: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskPatch = Partial<
  Pick<
    Task,
    | "title"
    | "notes"
    | "status"
    | "priority"
    | "assigneeIds"
    | "startDate"
    | "dueDate"
    | "parentId"
    | "blockedBy"
    | "order"
    | "link"
    | "labels"
    | "checklist"
    | "checklistOnCard"
    | "bucketId"
  >
>;

export type GroupBy = "bucket" | "progress" | "assignee" | "priority";

export type DueFilter = "all" | "overdue" | "soon";

export type Bucket = { id: string; name: string; order: number; limit: number | null };

export type BucketUpdate = { name?: string; limit?: number | null };

export type TasksResponse = { buckets: Bucket[]; tasks: Task[] };

export type BoardView = "board" | "grid" | "calendar" | "timeline" | "mine" | "charts";
