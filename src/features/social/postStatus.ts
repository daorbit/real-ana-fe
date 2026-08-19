import type { ScheduledPost } from "@/shared/types";

/**
 * How a post's stored status reads to a person.
 *
 * The server knows three states — `active`, `paused`, `sent` — and the UI shows
 * four, because a paused post is what someone means by a draft and a failed
 * last run is worth saying out loud even though it is not a status of its own.
 * Kept in one place so no component re-derives "paused means draft" for itself
 * and drifts from the rest.
 */
export type PostStage = "draft" | "scheduled" | "published" | "failed";

export const STAGE_LABEL: Record<PostStage, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
};

/** Mantine colour per stage. Failed borrows the app's warning orange. */
export const STAGE_COLOR: Record<PostStage, string> = {
  draft: "yellow",
  scheduled: "teal",
  published: "gray",
  failed: "orange",
};

/**
 * Which stage a post is in.
 *
 * Failure wins over everything: a post whose last run failed still carries a
 * status of `active`, and reporting it as merely "scheduled" hides the one
 * thing about it that needs attention.
 */
export function stageOf(post: ScheduledPost): PostStage {
  if (post.lastStatus === "failed") return "failed";
  if (post.status === "sent") return "published";
  if (post.status === "paused") return "draft";
  return "scheduled";
}
