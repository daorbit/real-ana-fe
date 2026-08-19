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
