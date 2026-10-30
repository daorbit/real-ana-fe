import { bucketKeyOf } from "./board";
import type { Bucket, Task } from "../types";

const BIG_CHECKLIST = 5;
const BIG_PARENT = 3;

export function earnsCelebration(task: Task, tasks: Task[], buckets: Bucket[]): boolean {
  if (task.status === "done") return false;
  const others = tasks.filter((t) => t.id !== task.id && t.status !== "done");
  const bucket = bucketKeyOf(task, buckets);
  const inBucket = (t: Task) => t.id !== task.id && bucketKeyOf(t, buckets) === bucket;
  const clearsBucket = tasks.some(inBucket) && !others.some(inBucket);
  const closesParent = Boolean(task.parentId) && !others.some((t) => t.parentId === task.parentId);
  const bigParent = tasks.filter((t) => t.parentId === task.id).length >= BIG_PARENT;
  return clearsBucket || closesParent || bigParent || task.checklist.length >= BIG_CHECKLIST;
}
