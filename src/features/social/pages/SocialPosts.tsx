import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, Group, Loader, SegmentedControl, Stack, Text, Title, Tooltip,
} from "@mantine/core";
import { CalendarClock, CheckCircle2, Plus, TriangleAlert } from "lucide-react";
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
  draftFromPost, emptyDraft, runAtISO, type Draft,
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

  const [composing, setComposing] = useState(false);
  // The post the composer is editing, or null when it is writing a new one.
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  // What the composer opens with. Held here rather than derived inside it, so
  // "Save & add another" can keep the cadence while the content clears.
  const [initial, setInitial] = useState<Draft>(emptyDraft);
  // The calendar answers "what is going out and where are the gaps"; the list
  // answers "what exactly does each one say". Both are the same posts.
  const [view, setView] = useState<"calendar" | "list">("calendar");
  // Connecting happens in a popup, so this page — and any half-written draft —
  // survives the round trip. `refetch` picks up the new connection state.
  const { connect, connecting } = useLinkedInConnect(refetch);
  const [disconnect, { isLoading: disconnecting }] = useDisconnectLinkedInMutation();

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
        await update({ id: editing.id, image: draft.image, ...fields }).unwrap();
        notify.success("Post updated.");
      } else {
        await create({
          workspaceId: active._id,
          image: draft.image || undefined,
          ...fields,
        }).unwrap();
        notify.success(draft.mode === "once" ? "Post scheduled." : "Repeating post created.");
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
      <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
        <div>
          <Title order={2}>Scheduled posts</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Plan your LinkedIn posts ahead. Each one publishes by itself, at the time you pick.
          </Text>
        </div>
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
              style={{ background: "#0A66C2", color: "#fff", flexShrink: 0 }}
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
        <Group justify="space-between" align="center" wrap="nowrap" mb="lg" gap="md">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <CheckCircle2 size={15} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
            <Text size="sm" c="dimmed" truncate>
              Publishing as <strong>{linkedin?.name}</strong> · times shown in {timezone}
            </Text>
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
              <Group justify="space-between" align="center" mb="md" wrap="nowrap">
                <Text fw={700} size="lg">Everything scheduled</Text>
                {viewControl}
              </Group>
              <PostQueue
                posts={posts}
                onEdit={openEdit}
                onToggle={toggle}
                onDelete={destroy}
                onPublish={publishNow}
                publishingId={publishingId}
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
