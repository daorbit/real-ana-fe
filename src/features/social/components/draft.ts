import type { PostFrequency, PostMode, PostProvider, ScheduledPost } from "@/shared/types";

/**
 * The shape a scheduled post is edited in, and the small pure helpers around
 * it.
 *
 * Kept apart from the composer so the list page can build and describe a draft
 * without pulling in the whole editor.
 */

export const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

export const FREQUENCIES = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];

/** LinkedIn's commentary cap, and its hashtag guidance. */
export const MAX_CAPTION = 3000;
export const MAX_HASHTAGS = 30;
export const MAX_IMAGE_MB = 8;

/** Instagram's carousel ceiling, which LinkedIn's multi-image post shares. */
export const MAX_IMAGES = 10;

/** Instagram's caption cap, which is the lower of the two. */
export const MAX_CAPTION_INSTAGRAM = 2200;

/** The cap that applies to the network a draft targets. */
export function captionLimit(provider: PostProvider): number {
  return provider === "instagram" ? MAX_CAPTION_INSTAGRAM : MAX_CAPTION;
}

/**
 * How late a post can reasonably be, in minutes.
 *
 * Publishing is driven by a scheduler that ticks on a fixed interval and sends
 * whatever is due, so a post never goes out early and is at most one tick late.
 * Keep this in step with that interval -- it is the number the composer and the
 * queue quote to set expectations, and quoting a tighter one than the scheduler
 * can keep is how "it published four minutes late" becomes a bug report.
 */
export const DELIVERY_WINDOW_MINUTES = 5;

/** Times people actually publish at, one click away from the number inputs. */
export const QUICK_TIMES = [
  { label: "09:00", hour: 9, minute: 0 },
  { label: "12:00", hour: 12, minute: 0 },
  { label: "17:30", hour: 17, minute: 30 },
];

export type Draft = {
  /**
   * Which network the post goes to.
   *
   * Chosen once, when the draft is new: the caption limit and the image rule
   * differ between the two, so the composer disables the picker when editing an
   * existing post rather than silently invalidating what is already written.
   */
  provider: PostProvider;
  name: string;
  caption: string;
  mode: PostMode;
  /** "2026-08-24" — the day a one-off publishes, in the author's own zone. */
  date: string;
  /** "14:20" — the time of day it publishes, same zone. */
  time: string;
  /**
   * The post's images, in publish order.
   *
   * Each is a data URL for a new upload or an https URL for one already stored.
   * Empty for a caption-only LinkedIn post; more than one is a carousel on
   * Instagram and a multi-image post on LinkedIn. Both networks cap it at ten.
   */
  images: string[];
  frequency: PostFrequency;
  hour: number;
  minute: number;
  weekday: number;
  dayOfMonth: number;
};

/** Tomorrow at 09:00 — a sane default that is never already in the past. */
function defaultSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { date: toDateInput(d), time: "09:00" };
}

/** A Date as the "YYYY-MM-DD" a date input wants, in local time. */
export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * The draft's date and time as a UTC instant.
 *
 * Built through the `Date` constructor's local-time parse, which is correct
 * here: the picker's clock is the browser's, and the browser's zone is the one
 * the composer states it is scheduling in.
 */
export function runAtISO(draft: Pick<Draft, "date" | "time">): string {
  const [y, m, d] = draft.date.split("-").map(Number);
  const [hh, mm] = draft.time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0).toISOString();
}

export function emptyDraft(): Draft {
  return {
    provider: "linkedin",
    name: "",
    caption: "",
    mode: "once",
    ...defaultSlot(),
    images: [],
    frequency: "weekly",
    hour: 9,
    minute: 0,
    weekday: 1,
    dayOfMonth: 1,
  };
}

export function draftFromPost(post: ScheduledPost): Draft {
  const at = post.runAt ? new Date(post.runAt) : null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    provider: post.provider ?? "linkedin",
    name: post.name,
    caption: post.caption,
    mode: post.mode ?? "once",
    // Read back in the browser's zone, which is where it was picked.
    date: at ? toDateInput(at) : defaultSlot().date,
    time: at ? `${pad(at.getHours())}:${pad(at.getMinutes())}` : defaultSlot().time,
    // `images` is the current shape; `imageUrl` is what rows written before
    // carousels carry, and what an older API build still returns alone.
    images: post.images?.length ? post.images : [post.imageUrl].filter(Boolean),
    frequency: post.frequency,
    hour: post.hour,
    minute: post.minute,
    weekday: post.weekday,
    dayOfMonth: post.dayOfMonth,
  };
}

/**
 * A new draft carrying a past run's content.
 *
 * For sending again what did not go out. A run is a record of one moment — it
 * has no schedule to move, and the schedule behind it may be long gone — so
 * this deliberately produces a *new* one-off at the next free slot rather than
 * pretending the old time can be recovered. What carries over is the work:
 * the title, the words and the image.
 */
export function draftFromRun(
  run: { name: string; caption: string; imageUrl: string; provider?: PostProvider },
): Draft {
  return {
    ...emptyDraft(),
    // The network carries over with the content: a post written for Instagram
    // is written to Instagram's rules, and sending it again means sending it
    // to the same place. Older runs predate the field and are LinkedIn's.
    provider: run.provider ?? "linkedin",
    name: run.name,
    caption: run.caption,
    images: [run.imageUrl].filter(Boolean),
  };
}

/** "Tue 24 Feb at 14:20", or the cadence, as a sentence. */
export function describe(
  post: Pick<Draft, "mode" | "date" | "time" | "frequency" | "hour" | "minute" | "weekday" | "dayOfMonth">,
) {
  if (post.mode === "once") {
    const at = new Date(runAtISO(post));
    if (Number.isNaN(at.getTime())) return "Pick a date and time";
    return at.toLocaleString(undefined, {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  }
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
}

/**
 * Whether a draft still matches what the composer opened with.
 *
 * Field-by-field rather than a JSON compare: the draft is flat, and a compare
 * that depends on key order would report a clean form as dirty the day someone
 * reorders the type.
 */
export function isDirty(draft: Draft, initial: Draft): boolean {
  return (Object.keys(initial) as (keyof Draft)[]).some((key) => {
    const a = draft[key];
    const b = initial[key];
    // `images` is the one array on the draft, and comparing it by reference
    // would report every untouched form as dirty.
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length !== b.length || a.some((v, i) => v !== b[i]);
    }
    return a !== b;
  });
}

/** Read a picked file as the base64 data URL the API expects. */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read that file"));
    reader.readAsDataURL(file);
  });
}
