import { WEEKDAYS } from "./components/draft";
import type { ScheduledPost } from "@/shared/types";

/** Whole days between today and `iso`, in the reader's own zone. */
function dayOffset(iso: string): number {
  const at = new Date(iso);
  return Math.round(
    (new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
}

/** "Every week on Monday at 09:00" — a repeating post's cadence. */
export function cadence(post: ScheduledPost): string {
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
}

/** "Today", "Tomorrow", or the full date — the heading a group sits under. */
export function dayLabel(iso: string): string {
  const at = new Date(iso);
  const days = dayOffset(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return at.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
    // The year only when it is not this one, which is how people write dates.
    year: at.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/**
 * "Tomorrow, 09:00" — the day as well as the time.
 *
 * A row showing only a time looks identical wherever it lands, so a post that
 * moved to another day would read as unchanged. Carrying the day on the row
 * itself is what makes a reschedule visible.
 */
export function timeLabel(iso: string): string {
  const at = new Date(iso);
  const time = at.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const days = dayOffset(iso);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  const date = at.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  return `${date}, ${time}`;
}

/** What a row says about when this post runs, cadence or instant. */
export function whenLabel(post: ScheduledPost): string {
  return post.mode === "repeat" ? cadence(post) : timeLabel(post.nextRunAt);
}

/**
 * "1 hour ago" — how long since `iso`, in the coarsest unit that still says
 * something. A card footer wants the shape of the gap, not its precision:
 * "2 days ago" is what someone actually reads off "created 51 hours ago".
 */
export function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });
  for (const [unit, size] of units) {
    if (seconds >= size) return format.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}

/**
 * The clock times a day offers to publish at, as ISO instants on `date`.
 *
 * The queue shows these as empty slots so a day reads as a plan with gaps in
 * it rather than as however many posts happen to exist. They are suggestions
 * only — nothing is stored until a post is written into one.
 */
export const SLOT_HOURS = [7, 12, 17, 21] as const;

export function daySlots(iso: string): string[] {
  const day = new Date(iso);
  return SLOT_HOURS.map((hour) => {
    const at = new Date(day);
    at.setHours(hour, 0, 0, 0);
    return at.toISOString();
  });
}
