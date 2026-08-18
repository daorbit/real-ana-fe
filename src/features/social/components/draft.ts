import type { PostFrequency, ScheduledPost } from "@/shared/types";

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

/** Times people actually publish at, one click away from the number inputs. */
export const QUICK_TIMES = [
  { label: "09:00", hour: 9, minute: 0 },
  { label: "12:00", hour: 12, minute: 0 },
  { label: "17:30", hour: 17, minute: 30 },
];

export type Draft = {
  name: string;
  caption: string;
  /** A data URL for a new upload, an https URL for one already stored, or "". */
  image: string;
  frequency: PostFrequency;
  hour: number;
  minute: number;
  weekday: number;
  dayOfMonth: number;
};

export function emptyDraft(): Draft {
  return {
    name: "",
    caption: "",
    image: "",
    frequency: "weekly",
    hour: 9,
    minute: 0,
    weekday: 1,
    dayOfMonth: 1,
  };
}

export function draftFromPost(post: ScheduledPost): Draft {
  return {
    name: post.name,
    caption: post.caption,
    image: post.imageUrl,
    frequency: post.frequency,
    hour: post.hour,
    minute: post.minute,
    weekday: post.weekday,
    dayOfMonth: post.dayOfMonth,
  };
}

/** "Every week on Monday at 09:00" — the cadence as a sentence. */
export function describe(
  post: Pick<Draft, "frequency" | "hour" | "minute" | "weekday" | "dayOfMonth">,
) {
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
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
