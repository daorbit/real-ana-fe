import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Group, Loader, SegmentedControl, Text, Title, Tooltip,
} from "@mantine/core";
import { CalendarDays, List as ListIcon, Plus } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notify";
import { useGetScheduledPostsQuery, useGetWorkspaceUsageQuery } from "@/app/store";
import { useLinkedInConnect } from "@/features/social/useLinkedInConnect";
import { usePostActions } from "@/features/social/hooks/usePostActions";
import { ConnectPrompt } from "@/features/social/components/ConnectPrompt";
import { PostComposer } from "@/features/social/components/PostComposer";
import { PostCalendar } from "@/features/social/components/PostCalendar";
import { PostQueue } from "@/features/social/components/PostQueue";
import { PostsEmptyState } from "@/features/social/components/PostsEmptyState";
import { draftFromPost, emptyDraft, toDateInput, type Draft } from "@/features/social/components/draft";
import type { ScheduledPost } from "@/shared/types";

 
export default function SocialPosts() {
  const { active } = useWorkspace();
  const { data, isLoading, refetch } = useGetScheduledPostsQuery();
  // The plan's own limits, so this page can say what is left before someone
  // writes a post rather than after.
  const { data: usage } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });
  const scheduledPosts = usage?.scheduledPosts;
  const postsFull = !!scheduledPosts && scheduledPosts.used >= scheduledPosts.quota;

  const [composing, setComposing] = useState(false);
  /** The post the composer is editing, or null when it is writing a new one. */
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  /** What the composer opens with, so "Save & add another" can keep the cadence. */
  const [initial, setInitial] = useState<Draft>(emptyDraft);
  // The list leads: it answers "what did I schedule, and what happened to it",
  // which is the question this page is opened with. The calendar answers a
  // second one — "where are the gaps in my week" — and is a click away.
  const [view, setView] = useState<"calendar" | "list">("list");
  /** A post that just changed time, so its row can say so where someone is looking. */
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  // Connecting happens in a popup, so this page — and any half-written draft —
  // survives the round trip. Disconnecting is not offered here: it lives with
  // the connection's own settings rather than on the page that depends on it.
  const { connect, connecting } = useLinkedInConnect(refetch);

  // The zone the schedule is written in. Taken from the browser so "9am" means
  // 9am where the author is, which is what the server stores and honours.
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const { save, toggle, publishNow, destroy, publishingId, saving } = usePostActions({
    workspaceId: active?._id,
    timezone,
    editing,
    onMoved: setRecentlyMovedId,
  });

  // Long enough to find the row after the list reorders under you, short enough
  // that the mark is gone before the next edit.
  useEffect(() => {
    if (!recentlyMovedId) return;
    const timer = setTimeout(() => setRecentlyMovedId(null), 8000);
    return () => clearTimeout(timer);
  }, [recentlyMovedId]);

  const posts = data?.posts ?? [];
  const linkedin = data?.linkedin;
  const needsPostingPermission = Boolean(
    linkedin?.connected && !linkedin.expired && linkedin.canPublish === false,
  );
  const ready = Boolean(linkedin?.connected && !linkedin.expired && !needsPostingPermission);

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

  
  const openAt = (at: string) => {
    if (postsFull) {
      openNew();
      return;
    }
    const slot = new Date(at);
    const pad = (n: number) => String(n).padStart(2, "0");
    setEditing(null);
    setInitial({
      ...emptyDraft(),
      date: toDateInput(slot),
      time: `${pad(slot.getHours())}:${pad(slot.getMinutes())}`,
    });
    setComposing(true);
  };

  const openEdit = (post: ScheduledPost) => {
    setEditing(post);
    setInitial(draftFromPost(post));
    setComposing(true);
  };

  /**
   * The calendar/list switch, built once and handed to whichever view is on.
   *
   * Both views own their own header row, and a control that jumped between two
   * corners depending on the view would be one people have to look for.
   */
  const viewControl = (
    <SegmentedControl
      size="sm"
      data={[
        {
          value: "list",
          label: (
            <Group gap={6} wrap="nowrap" justify="center">
              <ListIcon size={15} />
              <span>List</span>
            </Group>
          ),
        },
        {
          value: "calendar",
          label: (
            <Group gap={6} wrap="nowrap" justify="center">
              <CalendarDays size={15} />
              <span>Calendar</span>
            </Group>
          ),
        },
      ]}
      value={view}
      onChange={(v) => setView(v as "calendar" | "list")}
    />
  );

  return (
    <AppShell>
      {/* The feature, not the account. A profile name and face as the page
          title works while there is one network to publish to and breaks the
          moment there are three — the queue spans every connected account, so
          it is named for what it does rather than for whose it is. */}
      <Group justify="space-between" align="center" mb="lg" wrap="wrap" gap="md">
        <div style={{ minWidth: 0 }}>
          <Title order={2} lh={1.2}>Social posts</Title>
          <Text size="sm" c="dimmed" mt={4}>
            {ready ? `Publishing to LinkedIn · ${timezone}` : "No account connected yet"}
          </Text>
        </div>

        <Group gap="sm" wrap="nowrap" align="center">
          {/* Only once the queue is nearly full: a slot counter shown from the
              first post turns a limit nobody is near into a permanent nag. */}
          {scheduledPosts && scheduledPosts.used >= scheduledPosts.quota - 1 && (
            <Text size="xs" c={postsFull ? "orange" : "dimmed"} ta="right">
              {scheduledPosts.used} of {scheduledPosts.quota} scheduled
            </Text>
          )}

          {/* The view switch sits with New post rather than above the list:
              both answer "what do I do with this page", and splitting them put
              one control in a corner of its own. */}
          {viewControl}

          <Tooltip
            label={!ready ? "Connect LinkedIn first" : "This workspace's scheduled posts are full"}
            disabled={ready && !postsFull}
            withArrow
          >
            <Box>
              {/* The page's one primary action, so it carries the accent
                  rather than sitting in the same grey as the view switch
                  beside it — on this page writing a post is the thing, and a
                  default button made it read as one option among several. */}
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

      {!isLoading && !ready && (
        <ConnectPrompt
          linkedin={linkedin}
          needsPostingPermission={needsPostingPermission}
          connecting={connecting}
          onConnect={connect}
        />
      )}

      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : posts.length === 0 ? (
        <PostsEmptyState disabled={!ready} onCreate={() => openNew()} />
      ) : view === "calendar" ? (
        <Box className="post-calendar-scroll">
          <PostCalendar posts={posts} onOpen={openEdit} onCreateOn={openNew} />
        </Box>
      ) : (
        <PostQueue
          posts={posts}
          author={linkedin?.name ?? ""}
          onEdit={openEdit}
          onToggle={toggle}
          onDelete={destroy}
          onPublish={publishNow}
          /* Clicking a free slot is already the whole scheduling decision, so
             the composer opens on that instant rather than asking for it
             again. Withheld entirely when nothing can be scheduled — a row of
             live "New" buttons that all refuse is worse than none. */
          onCreate={ready && !postsFull ? openAt : undefined}
          publishingId={publishingId}
          recentlyMovedId={recentlyMovedId}
        />
      )}

      <PostComposer
        opened={composing}
        onClose={() => setComposing(false)}
        initial={initial}
        editing={editing}
        author={linkedin?.name ?? ""}
        timezone={timezone}
        saving={saving}
        workspaceId={active?._id}
        repeatingAllowed={scheduledPosts?.repeatingAllowed ?? true}
        onSave={save}
      />
    </AppShell>
  );
}
