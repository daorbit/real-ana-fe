import { bucketKeyOf } from "./board";
import { addDays, dayDiff } from "./dates";
import type { Bucket, Task } from "../types";

export const TIMELINE_DAYS = 42;
export const TIMELINE_STEP = 14;
export const DAY_WIDTH = 36;
export const HEADER_HEIGHT = 44;
export const GROUP_HEIGHT = 34;
export const ROW_HEIGHT = 38;
export const BAR_HEIGHT = 20;

export type TimelineBar = { task: Task; x: number; width: number; y: number };
export type TimelineGroup = { bucket: Bucket; y: number; bars: TimelineBar[] };
export type TimelineArrow = { id: string; from: TimelineBar; to: TimelineBar };

export type TimelineLayout = {
  groups: TimelineGroup[];
  arrows: TimelineArrow[];
  height: number;
  width: number;
  unscheduled: number;
};

function spanOf(task: Task): { start: Date; end: Date } | null {
  const first = task.startDate ?? task.dueDate;
  const last = task.dueDate ?? task.startDate;
  return first && last ? { start: new Date(first), end: new Date(last) } : null;
}

export function layoutTimeline(tasks: Task[], buckets: Bucket[], from: Date): TimelineLayout {
  const groups: TimelineGroup[] = [];
  const bars = new Map<string, TimelineBar>();
  let y = HEADER_HEIGHT;
  let unscheduled = 0;

  for (const bucket of buckets) {
    const inBucket = tasks.filter((task) => bucketKeyOf(task, buckets) === bucket.id);
    const rows = inBucket
      .map((task) => ({ task, span: spanOf(task) }))
      .filter((row): row is { task: Task; span: { start: Date; end: Date } } => Boolean(row.span))
      .sort((a, b) => a.span.start.getTime() - b.span.start.getTime());
    unscheduled += inBucket.length - rows.length;
    if (!rows.length) continue;

    const group: TimelineGroup = { bucket, y, bars: [] };
    y += GROUP_HEIGHT;
    for (const { task, span } of rows) {
      const bar = {
        task,
        x: dayDiff(from, span.start) * DAY_WIDTH + 3,
        width: (dayDiff(span.start, span.end) + 1) * DAY_WIDTH - 6,
        y: y + (ROW_HEIGHT - BAR_HEIGHT) / 2,
      };
      group.bars.push(bar);
      bars.set(task.id, bar);
      y += ROW_HEIGHT;
    }
    groups.push(group);
  }

  const arrows: TimelineArrow[] = [];
  for (const bar of bars.values())
    for (const blocker of bar.task.blockedBy) {
      const from = bars.get(blocker);
      if (from) arrows.push({ id: `${blocker}-${bar.task.id}`, from, to: bar });
    }

  return { groups, arrows, height: y, width: TIMELINE_DAYS * DAY_WIDTH, unscheduled };
}

export function timelineDays(from: Date): Date[] {
  return Array.from({ length: TIMELINE_DAYS }, (_, i) => addDays(from, i));
}

export function arrowPath({ from, to }: TimelineArrow): string {
  const startX = from.x + from.width;
  const startY = from.y + BAR_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + BAR_HEIGHT / 2;
  const bend = Math.max(startX + 10, endX - 10);
  return `M ${startX} ${startY} H ${bend} V ${endY} H ${endX - 2}`;
}
