import { useEffect, useMemo, useState } from "react";
import {
  Alert, Avatar, Badge, Box, Button, Card, Group, Loader, SegmentedControl, Stack, Text, Title,
  Tooltip,
} from "@mantine/core";
import { CalendarClock, Plus, Rocket, TriangleAlert } from "lucide-react";
import { LINKEDIN_BLUE, LinkedInMark } from "@/shared/ui/LinkedInMark";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { confirmDelete, notify, errMessage } from "@/shared/lib/notify";
import {
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
  usePublishScheduledPostMutation,
  useDisconnectLinkedInMutation,
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
  const { connect, connecting } = useLinkedInConnect(refetch);
  const [disconnect, { isLoading: disconnecting }] = useDisconnectLinkedInMutation();

  // Long enough to find the row after the queue reorders under you, short
  // enough that the mark is gone before the next edit.
  useEffect(() => {
    if (!recentlyMovedId) return;
    const timer = setTimeout(() => setRecentlyMovedId(null), 8000);
    return () => clearTimeout(timer);
  }, [recentlyMovedId]);

  /**
   * Drop the connection.
   *
   * Existing schedules are deliberately left in place rather than deleted: the
   * posts someone wrote are still theirs, and reconnecting should resume them
   * rather than make them start over. They simply stop publishing until there
   * is an account to publish as.
   */
  const disconnectLinkedIn = () => {
    confirmDelete({
      title: "Disconnect LinkedIn?",
      body: (
        <>
          Nothing scheduled will publish until you reconnect. Your posts are kept,
          not deleted.
        </>
      ),
      confirmLabel: "Disconnect",
      onConfirm: async () => {
        try {
          await disconnect().unwrap();
          notify.success("LinkedIn disconnected. Your posts are paused until you reconnect.");
          refetch();
        } catch (e) {
          notify.error(errMessage(e, "Could not disconnect LinkedIn."));
        }
      },
    });
  };

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
  const save = async (draft: Draft): Promise<boolean> => {
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
        await create({
          workspaceId: active._id,
          image: draft.image || undefined,
          ...fields,
        }).unwrap();
        // The confirmation is the last thing read before the composer closes,
        // so it repeats the delivery window rather than claiming a punctuality
        // the scheduler does not promise.
        notify.success(
          draft.mode === "once"
            ? `Post scheduled. It publishes within ${DELIVERY_WINDOW_MINUTES} minutes of the time you picked.`
            : "Repeating post created.",
        );
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
      {/* This page is framed as social scheduling, not a LinkedIn-only tool: the
          tile is a neutral "outgoing post" mark rather than LinkedIn's own
          colour, and the strip beneath it names every network this composer
          will eventually reach. Facebook and Instagram sit there dimmed and
          unclickable now -- a promise of where this grows, not a toggle that
          does nothing when pressed. */}
      <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <Group align="flex-start" gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            aria-hidden
            style={{
              width: 46,
              height: 46,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 12,
              background: "var(--mantine-color-emerald-6)",
              boxShadow: "0 0 0 4px var(--mantine-color-emerald-light), 0 6px 18px -4px var(--mantine-color-emerald-light)",
            }}
          >
            <Rocket size={22} color="#fff" />
          </Box>
          <div style={{ minWidth: 0 }}>
            <Group gap={10} wrap="wrap" align="center">
              <Title order={2}>Social posts</Title>
            </Group>
            <Text c="dimmed" size="sm" mt={4} style={{ maxWidth: "58ch" }}>
              Write a post, pick when it should go out, and Quantalog publishes it for you —
              once, or on a repeating schedule.
            </Text>
            {/* One row: which networks exist, which is live, which is on hold.
                LinkedIn carries the Connected state itself rather than the page
                header, because that state belongs to the account, not the
                feature -- a second network will have its own. */}
            <Group gap={8} mt={10} wrap="wrap">
              <Badge
                size="sm"
                variant={ready ? "light" : "outline"}
                color={ready ? "teal" : "gray"}
                leftSection={<LinkedInMark size={11} color={ready ? undefined : "var(--mantine-color-dimmed)"} />}
              >
                LinkedIn{ready ? " · Connected" : ""}
              </Badge>
              <Tooltip label="Facebook support is planned, not available yet" withArrow>
                <Badge size="sm" variant="outline" color="gray" style={{ opacity: 0.55, cursor: "default" }}>
                  Facebook · Soon
                </Badge>
              </Tooltip>
              <Tooltip label="Instagram support is planned, not available yet" withArrow>
                <Badge size="sm" variant="outline" color="gray" style={{ opacity: 0.55, cursor: "default" }}>
                  Instagram · Soon
                </Badge>
              </Tooltip>
            </Group>
          </div>
        </Group>
        <Tooltip label="Connect LinkedIn first" disabled={ready} withArrow>
          <Box>
            <Button
              leftSection={<Plus size={16} />}
              disabled={!ready}
              onClick={() => openNew()}
            >
              New post
            </Button>
          </Box>
        </Tooltip>
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

      {/* Connected: say who these posts go out as, and keep the account
          reachable. Without this the connection is only changeable from the
          Share panel, which is a strange place to have to go to disconnect
          something this page depends on. */}
      {ready && (
        <Card withBorder radius="md" padding="sm" mb="lg">
          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
              <Avatar radius="xl" size={34} color="blue" style={{ flexShrink: 0 }}>
                {linkedin?.name?.trim().charAt(0).toUpperCase() || "?"}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>{linkedin?.name}</Text>
                  <LinkedInMark size={13} />
                </Group>
                {/* The account and the clock are the two facts that decide what
                    lands in the feed and when, so they are stated together. */}
                <Text size="xs" c="dimmed" truncate>
                  Posts publish to this profile · times in {timezone}
                </Text>
              </div>
            </Group>
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              loading={disconnecting}
              onClick={disconnectLinkedIn}
              style={{ flexShrink: 0 }}
            >
              Disconnect
            </Button>
          </Group>
        </Card>
      )}


      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : posts.length === 0 ? (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="xs">
            <CalendarClock size={28} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text fw={600}>Nothing scheduled yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              Write a post, pick a date and time, and it publishes without you.
            </Text>
            <Button mt="sm" leftSection={<Plus size={16} />} disabled={!ready} onClick={() => openNew()}>
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
        onSave={save}
      />

    </AppShell>
  );
}
