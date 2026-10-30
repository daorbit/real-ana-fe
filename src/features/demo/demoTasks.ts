import type { Bucket, Task } from "@/features/tasks/types";

const now = Date.now();
const DAY = 86_400_000;
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

let nextKey = 1;

export const demoBuckets: Bucket[] = ["Backlog", "To do", "In progress", "Review", "Blocked", "Done"].map((name, order) => ({
  id: `demo-bucket-${order}`,
  name,
  order,
  limit: name === "In progress" ? 3 : null,
}));

const bucket = (index: number) => demoBuckets[index].id;

function task(id: string, title: string, status: Task["status"], order: number, extra: Partial<Task> = {}): Task {
  return {
    id,
    key: nextKey++,
    bucketId: bucket(1),
    title,
    notes: "",
    status,
    priority: "medium",
    assigneeIds: [],
    startDate: null,
    dueDate: null,
    parentId: null,
    blockedBy: [],
    order,
    link: "",
    labels: [],
    checklist: [],
    checklistOnCard: false,
    createdBy: "demo-user-priya",
    completedAt: status === "done" ? iso(-2 * DAY) : null,
    createdAt: iso(-10 * DAY),
    updatedAt: iso(-1 * DAY),
    ...extra,
  };
}

export const demoTasks: Task[] = [
  task("demo-task-1", "Fix missing meta descriptions on the pricing page", "todo", 0, {
    bucketId: bucket(1),
    priority: "urgent",
    assigneeIds: ["demo-user-priya", "demo-user-marcus"],
    startDate: iso(-4 * DAY),
    dueDate: iso(-1 * DAY),
    link: "/app/seo",
    labels: [{ text: "SEO", color: "teal" }],
  }),
  task("demo-task-2", "Write a launch post for the spring sale", "todo", 1, {
    bucketId: bucket(0),
    assigneeIds: ["demo-user-marcus"],
    startDate: iso(0),
    dueDate: iso(5 * DAY),
    blockedBy: ["demo-task-4"],
    labels: [
      { text: "Marketing", color: "pink" },
      { text: "Social", color: "violet" },
    ],
    checklist: [
      { id: "c1", text: "Draft copy", done: true },
      { id: "c2", text: "Pick the image", done: false },
      { id: "c3", text: "Schedule on LinkedIn", done: false },
    ],
    checklistOnCard: true,
  }),
  task("demo-task-3", "Add FAQ schema to the help centre", "todo", 2, {
    bucketId: bucket(0),
    priority: "low",
    labels: [{ text: "SEO", color: "teal" }],
  }),
  task("demo-task-4", "Compress hero images on the home page", "doing", 0, {
    bucketId: bucket(2),
    priority: "high",
    assigneeIds: ["demo-user-hinata"],
    startDate: iso(-2 * DAY),
    dueDate: iso(0),
    notes: "Lighthouse flags 1.8 MB of images above the fold.",
    labels: [{ text: "Speed", color: "amber" }],
    checklist: [
      { id: "c4", text: "Convert to WebP", done: true },
      { id: "c5", text: "Add width and height", done: true },
      { id: "c6", text: "Lazy-load below the fold", done: false },
    ],
  }),
  task("demo-task-5", "Reply to new Google reviews", "doing", 1, {
    bucketId: bucket(3),
    assigneeIds: ["demo-user-priya"],
    labels: [{ text: "Reviews", color: "blue" }],
  }),
  task("demo-task-6", "Set up the weekly traffic report", "done", 0, { assigneeIds: ["demo-user-marcus"], bucketId: bucket(5) }),
  task("demo-task-7", "Connect Search Console", "done", 1, { labels: [{ text: "SEO", color: "teal" }], bucketId: bucket(5) }),
  task("demo-task-8", "Pick the hero image for the sale post", "todo", 3, {
    bucketId: bucket(0),
    parentId: "demo-task-2",
    assigneeIds: ["demo-user-priya"],
    dueDate: iso(3 * DAY),
  }),
  task("demo-task-9", "Write the LinkedIn caption", "done", 2, {
    bucketId: bucket(5),
    parentId: "demo-task-2",
    assigneeIds: ["demo-user-marcus"],
    completedAt: iso(-1 * DAY),
  }),
];
