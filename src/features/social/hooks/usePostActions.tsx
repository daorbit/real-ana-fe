import { useState } from "react";
import {
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
  usePublishScheduledPostMutation,
} from "@/app/store";
import { confirmDelete, notify, errMessage } from "@/shared/lib/notify";
import { DELIVERY_WINDOW_MINUTES, describe, runAtISO, type Draft } from "../components/draft";
import type { ScheduledPost } from "@/shared/types";

/**
 * Everything that changes a scheduled post, with the confirmations and messages
 * that go with it.
 *
 * Held apart from the page so the page is layout: what these operations say to
 * the user is as much a part of them as the request, and neither is a rendering
 * concern.
 */
export function usePostActions({
  workspaceId,
  timezone,
  editing,
  onMoved,
}: {
  workspaceId: string | undefined;
  timezone: string;
  /** The post the composer is editing, or null when writing a new one. */
  editing: ScheduledPost | null;
  /** A post whose time changed, so the list can mark where it went. */
  onMoved: (id: string) => void;
}) {
  const [create, { isLoading: creating }] = useCreateScheduledPostMutation();
  const [update, { isLoading: updating }] = useUpdateScheduledPostMutation();
  const [remove] = useDeleteScheduledPostMutation();
  const [publish] = usePublishScheduledPostMutation();
  /** Which row is publishing, so only its own button shows a spinner. */
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const save = async (draft: Draft, asDraft = false): Promise<boolean> => {
    if (!workspaceId) {
      notify.error("Pick a workspace first.");
      return false;
    }
    if (!draft.caption.trim()) {
      notify.error("The post cannot be empty.");
      return false;
    }
    // Instagram has no text-only post — a media container is created around an
    // image — so this is refused here rather than by the server, where it would
    // cost a round trip to say the same thing.
    if (draft.provider === "instagram" && !draft.image) {
      notify.error("Instagram posts need an image.");
      return false;
    }

    // Only the fields the chosen mode uses are sent. A one-off carries an
    // instant; a repeat carries a cadence, and the server keeps whichever it
    // was given rather than mixing the two.
    const fields = {
      name: draft.name.trim() || "Scheduled post",
      caption: draft.caption,
      mode: draft.mode,
      timezone,
      ...(draft.mode === "once"
        ? { runAt: runAtISO(draft) }
        : {
            frequency: draft.frequency,
            hour: draft.hour,
            minute: draft.minute,
            weekday: draft.weekday,
            dayOfMonth: draft.dayOfMonth,
          }),
    };

    try {
      if (editing) {
        // An unchanged image is sent back as the https URL it already is, which
        // the server takes as "leave it alone" — only a data URL is re-uploaded.
        const saved = await update({ id: editing.id, image: draft.image, ...fields }).unwrap();
        // Rescheduling reorders the queue, so a post that moved to another day
        // would otherwise look untouched where someone is still looking.
        const moved = editing.nextRunAt !== saved.nextRunAt;
        notify.success(moved ? `Post moved to ${describe(draft)}.` : "Post updated.");
        if (moved) onMoved(saved.id);
      } else {
        // `provider` is sent on create only. It is fixed for the life of a post
        // — the server refuses a change rather than revalidating the caption and
        // image against a different network's rules — so the edit call above
        // deliberately leaves it out.
        const created = await create({
          workspaceId,
          provider: draft.provider,
          image: draft.image || undefined,
          ...fields,
        }).unwrap();

        // Create always makes an active post, so a draft is paused straight
        // after. Two calls rather than one, but it keeps drafts entirely a
        // matter of status — nothing new for the server to understand.
        if (asDraft) {
          await update({ id: created.id, status: "paused" }).unwrap();
          notify.success("Saved as a draft. It publishes nothing until you schedule it.");
        } else {
          // The last thing read before the composer closes, so it repeats the
          // delivery window rather than claiming a punctuality the scheduler
          // does not promise.
          notify.success(
            draft.mode === "once"
              ? `Post scheduled. It publishes within ${DELIVERY_WINDOW_MINUTES} minutes of the time you picked.`
              : "Repeating post created.",
          );
        }
      }
      return true;
    } catch (e) {
      notify.error(errMessage(e, "Could not save that schedule."));
      return false;
    }
  };

  const toggle = async (post: ScheduledPost) => {
    const next = post.status === "active" ? "paused" : "active";
    try {
      await update({ id: post.id, status: next }).unwrap();
      notify.success(next === "active" ? "Post scheduled." : "Moved to drafts.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update that schedule."));
    }
  };

  /**
   * Publish now, behind a confirmation.
   *
   * Asked rather than done: this posts publicly, under the user's own name, and
   * nothing here can take it back. The dialog names the post because the button
   * sits on a row among others, and says plainly that the schedule survives —
   * otherwise "post now" reads like it might consume the next run.
   */
  const publishNow = (post: ScheduledPost) => {
    // Named from the post rather than fixed: this dialog is the last thing read
    // before something goes out publicly, and naming the wrong network there is
    // the one place a mistake cannot be taken back.
    const network = post.provider === "instagram" ? "Instagram" : "LinkedIn";
    confirmDelete({
      title: "Post this now?",
      confirmLabel: "Post now",
      confirmColor: "teal",
      body: (
        <>
          <strong>{post.name}</strong> will be published to {network} immediately.
          {post.mode === "repeat" && " Its schedule is unchanged — it will still run as usual."}
          {" A published post cannot be unpublished from here."}
        </>
      ),
      onConfirm: async () => {
        setPublishingId(post.id);
        try {
          const res = await publish(post.id).unwrap();
          notify.success(res.postUrl ? `Posted to ${network}.` : "Posted.");
        } catch (e) {
          notify.error(errMessage(e, "Could not publish that post."));
        } finally {
          setPublishingId(null);
        }
      },
    });
  };

  /**
   * Delete, behind a confirmation.
   *
   * Asked rather than done: the post's text and its uploaded image both go, and
   * neither comes back. The dialog names the post so a misclick on the wrong
   * row is visible before it is acted on.
   */
  const destroy = (post: ScheduledPost) => {
    confirmDelete({
      title: "Delete this post?",
      body: (
        <>
          <strong>{post.name}</strong> and its image will be permanently deleted.
          {post.status !== "sent" && " It will not publish."}
          {" This cannot be undone."}
        </>
      ),
      onConfirm: async () => {
        try {
          await remove(post.id).unwrap();
          notify.success("Post deleted.");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete that post."));
        }
      },
    });
  };

  return { save, toggle, publishNow, destroy, publishingId, saving: creating || updating };
}
