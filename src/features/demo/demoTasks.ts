import type { Task } from "@/features/tasks/types";

const now = Date.now();
const DAY = 86_400_000;
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

let nextKey = 1;

function task(id: string, title: string, status: Task["status"], order: number, extra: Partial<Task> = {}): Task {
  return {
    id,
    key: nextKey++,
    title,
    notes: "",
    status,
    priority: "medium",
    assigneeId: null,
    dueDate: null,
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
    priority: "urgent",
    assigneeId: "demo-user-priya",
    dueDate: iso(-1 * DAY),
    link: "/app/seo",
    labels: [{ text: "SEO", color: "teal" }],
  }),
  task("demo-task-2", "Write a launch post for the spring sale", "todo", 1, {
    assigneeId: "demo-user-marcus",
    dueDate: iso(2 * DAY),
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
    priority: "low",
    labels: [{ text: "SEO", color: "teal" }],
  }),
  task("demo-task-4", "Compress hero images on the home page", "doing", 0, {
    priority: "high",
    assigneeId: "demo-user-hinata",
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
    assigneeId: "demo-user-priya",
    labels: [{ text: "Reviews", color: "blue" }],
  }),
  task("demo-task-6", "Set up the weekly traffic report", "done", 0, { assigneeId: "demo-user-marcus" }),
  task("demo-task-7", "Connect Search Console", "done", 1, { labels: [{ text: "SEO", color: "teal" }] }),
];
