import { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, Group, Loader, SegmentedControl, Stack, Text, Title, Tooltip,
} from "@mantine/core";
import { CalendarClock, Plus, TriangleAlert } from "lucide-react";
import { LINKEDIN_BLUE } from "@/shared/ui/LinkedInMark";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { confirmDelete, notify, errMessage } from "@/shared/lib/notify";
import {
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
  usePublishScheduledPostMutation,
  useGetWorkspaceUsageQuery,
} from "@/app/store";
import { useLinkedInConnect } from "@/features/social/useLinkedInConnect";
import { PostComposer } from "@/features/social/components/PostComposer";
import { PostCalendar } from "@/features/social/components/PostCalendar";
import { PostQueue } from "@/features/social/components/PostQueue";
import {
  DELIVERY_WINDOW_MINUTES, describe, draftFromPost, emptyDraft, runAtISO, type Draft,
} from "@/features/social/components/draft";
import type { ScheduledPost } from "@/shared/types";

/**
 * Scheduled LinkedIn posts.
 *
 * The post is written here in full — caption and image both — and stored as
 * finished content. The server publishes it unchanged on the cadence chosen,
 * which is the property that makes this predictable: what is composed on this
 * page is exactly what appears in the feed, with nothing generated in between.
 *
 * The image is uploaded to Cloudinary server-side from a base64 data URL, the
 * same path avatars already take.
 */

export default function SocialPosts() {
  const { active } = useWorkspace();
  const { data, isLoading, refetch } = useGetScheduledPostsQuery();
  // The plan's own limits, so this page can say what is left before someone
  // writes a post rather than after. Refetched alongside the posts, since
  // creating or deleting one changes what is left.
  const { data: usage } = useGetWorkspaceUsageQuery(active?._id ?? "", {
    skip: !active?._id,
  });
  const scheduledPosts = usage?.scheduledPosts;
  const postsFull = !!scheduledPosts && scheduledPosts.used >= scheduledPosts.quota;
  const [create, { isLoading: creating }] = useCreateScheduledPostMutation();
  const [update, { isLoading: updating }] = useUpdateScheduledPostMutation();
  const [remove] = useDeleteScheduledPostMutation();
  const [publish] = usePublishScheduledPostMutation();
  // Which row is publishing, so only its own button shows the spinner.
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // A post that just changed time, so its row can say so where the person is
  // actually looking. Cleared on a timer rather than left standing: it marks an
  // edit that just happened, and a highlight that never fades stops meaning
  // "this moved" and starts meaning nothing at all.
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  const [composing, setComposing] = useState(false);
  // The post the composer is editing, or null when it is writing a new one.
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  // What the composer opens with. Held here rather than derived inside it, so
  // "Save & add another" can keep the cadence while the content clears.
  const [initial, setInitial] = useState<Draft>(emptyDraft);
  // The list leads: it answers "what did I schedule, and what happened to it",
  // which is the question this page is opened with. The calendar answers a
  // second one -- "where are the gaps in my week" -- and is a click away.
  const [view, setView] = useState<"calendar" | "list">("list");
  // Connecting happens in a popup, so this page — and any half-written draft —
  // survives the round trip. `refetch` picks up the new connection state.
  // Disconnecting is not offered here: it lives with the rest of the LinkedIn
  // connection's own settings, not duplicated on the page that merely depends
  // on it.
  const { connect, connecting } = useLinkedInConnect(refetch);

  // Long enough to find the row after the queue reorders under you, short
  // enough that the mark is gone before the next edit.
  useEffect(() => {
    if (!recentlyMovedId) return;
    const timer = setTimeout(() => setRecentlyMovedId(null), 8000);
    return () => clearTimeout(timer);
  }, [recentlyMovedId]);

  // The zone the schedule is written in. Taken from the browser so "9am" means
  // 9am where the author is, which is what the server stores and honours.
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const linkedin = data?.linkedin;
  const posts = data?.posts ?? [];
  // A schedule cannot publish without a live connection that is allowed to
  // post, so the composer is held shut rather than letting someone write a post
  // that will only fail. `canPublish` is false for an account that signed in
  // with LinkedIn but never granted publishing — sign-in no longer asks for it.
  const ready = Boolean(linkedin?.connected && !linkedin.expired && linkedin.canPublish !== false);
  // Connected, but only for identity. Needs the publishing consent, not a whole
  // new connection — worth saying differently from "not connected at all".
  const needsPostingPermission = Boolean(
    linkedin?.connected && !linkedin.expired && linkedin.canPublish === false,
  );

  const openNew = (date?: string) => {
    // Refused before the composer opens, not after a post is written: the
    // server would reject the save either way, but being told at the point of
    // saving reads as the app losing the work rather than as a plan boundary.
    if (postsFull) {
      notify.error(
        `This workspace can hold ${scheduledPosts?.quota} scheduled post${scheduledPosts?.quota === 1 ? "" : "s"} at once. Publish, delete or upgrade to add another.`,
      );
      return;
    }
    setEditing(null);
    // Clicking a day on the calendar is already half the scheduling decision,
    // so the composer opens on that date rather than making it be picked twice.
    setInitial(date ? { ...emptyDraft(), date } : emptyDraft());
    setComposing(true);
  };

  const openEdit = (post: ScheduledPost) => {
    setEditing(post);
    setInitial(draftFromPost(post));
    setComposing(true);
  };

  /**
   * Create or update, depending on what the composer was opened with.
   *
   * Returns whether it saved: the composer clears for the next post on true and
   * keeps the draft on screen on false, so a failure never loses what was
   * written.
   */
  const save = async (draft: Draft, asDraft = false): Promise<boolean> => {
    if (!active?._id) {
      notify.error("Pick a workspace first.");
      return false;
    }
    if (!draft.caption.trim()) {
      notify.error("The post cannot be empty.");
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
        // Rescheduling reorders the queue, and a row shows only a time, so a
        // post that moved to another day looks untouched in the place someone
        // is still looking at. Say where it went, and mark the row itself.
        const moved = editing.nextRunAt !== saved.nextRunAt;
        notify.success(moved ? `Post moved to ${describe(draft)}.` : "Post updated.");
        if (moved) setRecentlyMovedId(saved.id);
      } else {
        const created = await create({
          workspaceId: active._id,
          image: draft.image || undefined,
          ...fields,
        }).unwrap();

        // Create always makes an active post, so a draft is paused straight
        // after. Two calls rather than one, but it keeps drafts entirely a
        // matter of status — nothing new for the server to understand.
        if (asDraft) {
          await update({ id: created.id, status: "paused" }).unwrap();
          notify.success("Saved as a draft. It publishes nothing until you resume it.");
        } else {
          // The confirmation is the last thing read before the composer closes,
          // so it repeats the delivery window rather than claiming a punctuality
          // the scheduler does not promise.
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
      notify.success(next === "active" ? "Schedule resumed." : "Schedule paused.");
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
    confirmDelete({
      title: "Post this now?",
      confirmLabel: "Post now",
      confirmColor: "teal",
      body: (
        <>
          <strong>{post.name}</strong> will be published to LinkedIn immediately.
          {post.mode === "repeat" && " Its schedule is unchanged — it will still run as usual."}
          {" A published post cannot be unpublished from here."}
        </>
      ),
      onConfirm: async () => {
        setPublishingId(post.id);
        try {
          const res = await publish(post.id).unwrap();
          notify.success(res.postUrl ? "Posted to LinkedIn." : "Posted.");
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

  /**
   * The calendar/list switch, built once and handed to whichever view is on.
   *
   * Both views own their own header row, and a control that jumped between two
   * different corners depending on the view would be a control people have to
   * look for.
   */
  const viewControl = (
    <SegmentedControl
      size="sm"
      data={[
        { value: "calendar", label: "Calendar" },
        { value: "list", label: "List" },
      ]}
      value={view}
      onChange={(v) => setView(v as "calendar" | "list")}
    />
  );

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div style={{ minWidth: 0 }}>
          <Title order={2}>Social posts</Title>
          <Text c="dimmed" size="sm" mt={4} style={{ maxWidth: "58ch" }}>
            Write a post, pick when it should go out, and Quantalog publishes it for you —
            once, or on a repeating schedule.
          </Text>
        </div>
        <Group gap="sm" wrap="nowrap" align="center">
          {/* Only once the queue is close to full: a slot counter shown from
              the first post turns a limit nobody is near into a permanent
              nag, where the same line at the boundary is the one useful
              moment to say it. */}
          {scheduledPosts && scheduledPosts.used >= scheduledPosts.quota - 1 && (
            <Text size="xs" c={postsFull ? "orange" : "dimmed"} ta="right">
              {scheduledPosts.used} of {scheduledPosts.quota} scheduled
            </Text>
          )}
          <Tooltip
            label={!ready ? "Connect LinkedIn first" : "This workspace's scheduled posts are full"}
            disabled={ready && !postsFull}
            withArrow
          >
            <Box>
              <Button
                leftSection={<Plus size={16} />}
                disabled={!ready || postsFull}
                onClick={() => openNew()}
              >
                New post
              </Button>
            </Box>
          </Tooltip>
        </Group>
      </Group>

      {/* The connection is the precondition for everything on this page, so its
          state is stated once at the top rather than repeated on each row — and
          it carries the button that fixes it. Sending someone to another page to
          connect makes the thing they came here to do a two-stop errand. */}
      {!isLoading && !ready && (
        <Alert
          color={linkedin?.expired ? "orange" : "blue"}
          variant="light"
          icon={<TriangleAlert size={18} />}
          mb="lg"
        >
          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Text size="sm">
              {linkedin?.expired
                ? "Your LinkedIn connection has expired. Reconnect it to resume publishing."
                : needsPostingPermission
                  ? "Your LinkedIn account is connected for sign-in. Allow posting to schedule posts from here."
                  : "Connect your LinkedIn account to start scheduling posts."}
            </Text>
            <Button
              size="compact-sm"
              loading={connecting}
              onClick={connect}
              style={{ background: LINKEDIN_BLUE, color: "#fff", flexShrink: 0 }}
            >
              {linkedin?.expired
                ? "Reconnect LinkedIn"
                : needsPostingPermission
                  ? "Allow posting"
                  : "Connect LinkedIn"}
            </Button>
          </Group>

          {/* LinkedIn's consent screen asks for create/modify/delete — the reach
              of the one permission it offers for publishing, not what this app
              does. Better heard from us beforehand than read cold there. */}
          {!linkedin?.expired && (
            <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
              LinkedIn will ask you to allow creating, modifying and deleting posts — that is
              the wording of the single permission it offers for publishing. Quantalog only
              ever creates the posts you schedule here. It never edits or deletes anything on
              your profile.
            </Text>
          )}
        </Alert>
      )}

      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : posts.length === 0 ? (
        /* Given room to breathe rather than squeezed into a short band across
           the whole page: this is the only thing on screen, so it is the page
           until there is a post, and the icon is sized to lead it. */
        <Card withBorder radius="md" py={64} px="xl">
          <Stack align="center" gap={0} style={{ maxWidth: "42ch", margin: "0 auto" }}>
            <Box
              aria-hidden
              style={{
                width: 64,
                height: 64,
                display: "grid",
                placeItems: "center",
                borderRadius: 16,
                marginBottom: 20,
                background: "var(--mantine-color-default)",
                border: "1px solid var(--mantine-color-default-border)",
              }}
            >
              <CalendarClock size={28} style={{ color: "var(--mantine-color-dimmed)" }} />
            </Box>
            <Text fw={650} fz="lg">Nothing scheduled yet</Text>
            <Text size="sm" c="dimmed" ta="center" mt={6} style={{ lineHeight: 1.6 }}>
              Write a post, pick a date and time, and Quantalog publishes it for you — once,
              or on a repeating schedule.
            </Text>
            <Button
              mt="xl"
              size="md"
              leftSection={<Plus size={16} />}
              disabled={!ready}
              onClick={() => openNew()}
            >
              Schedule your first post
            </Button>
          </Stack>
        </Card>
      ) : (
        <>
          {/* One toolbar for both views, so the month controls and the switch
              between them read as one bar rather than three stacked corners. */}
          {view === "calendar" ? (
            <Box className="post-calendar-scroll">
              <PostCalendar
                posts={posts}
                onOpen={openEdit}
                onCreateOn={openNew}
                viewControl={viewControl}
              />
            </Box>
          ) : (
            <>
              {/* No heading beside the switch: the page title already says
                  "Scheduled posts" and the filter tabs below name whichever
                  shelf is showing, so a third label in between says nothing. */}
              <Group justify="flex-end" align="center" mb="md" wrap="nowrap">
                {viewControl}
              </Group>
              <PostQueue
                posts={posts}
                onEdit={openEdit}
                onToggle={toggle}
                onDelete={destroy}
                onPublish={publishNow}
                publishingId={publishingId}
                recentlyMovedId={recentlyMovedId}
              />
            </>
          )}
        </>
      )}

      <PostComposer
        opened={composing}
        onClose={() => setComposing(false)}
        initial={initial}
        editing={editing}
        author={linkedin?.name ?? ""}
        timezone={timezone}
        saving={creating || updating}
        workspaceId={active?._id}
        repeatingAllowed={scheduledPosts?.repeatingAllowed ?? true}
        onSave={save}
      />

    </AppShell>
  );
}
