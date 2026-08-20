import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Group, Loader, SegmentedControl, Text, Title, Tooltip,
} from "@mantine/core";
import { CalendarDays, List as ListIcon, Plus, Send } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notify";
import { usePostFilters } from "@/features/social/hooks/usePostFilters";
import { PostFilters } from "@/features/social/components/PostFilters";
import {
  useGetScheduledPostsQuery, useGetSentPostsQuery, useGetWorkspaceUsageQuery,
} from "@/app/store";
import { useLinkedInConnect } from "@/features/social/useLinkedInConnect";
import { usePostActions } from "@/features/social/hooks/usePostActions";
import { ConnectPrompt } from "@/features/social/components/ConnectPrompt";
import { PostComposer } from "@/features/social/components/PostComposer";
import { PostCalendar } from "@/features/social/components/PostCalendar";
import { PostQueue } from "@/features/social/components/PostQueue";
import { PostsEmptyState } from "@/features/social/components/PostsEmptyState";
import { SentTimeline } from "@/features/social/components/SentTimeline";
import { draftFromPost, emptyDraft, toDateInput, type Draft } from "@/features/social/components/draft";
import type { ScheduledPost } from "@/shared/types";

 
export default function SocialPosts() {
  const { active } = useWorkspace();
  const { data, isLoading, refetch } = useGetScheduledPostsQuery();
 
  const { data: usage } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });
  const scheduledPosts = usage?.scheduledPosts;
  const postsFull = !!scheduledPosts && scheduledPosts.used >= scheduledPosts.quota;

  const [composing, setComposing] = useState(false);
 
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
 
  const [initial, setInitial] = useState<Draft>(emptyDraft);
 
  const [view, setView] = useState<"calendar" | "list" | "sent">("list");

  /**
   * The cursor for the published history, and nothing more.
   *
   * Pages are merged inside the cache — see `getSentPosts` — so this holds only
   * the position, not the accumulated list. Reset to undefined whenever the tab
   * is opened afresh so a stale cursor cannot skip the newest posts.
   */
  const [sentCursor, setSentCursor] = useState<string | undefined>(undefined);

  const {
    data: sent,
    isLoading: sentLoading,
    isFetching: sentFetching,
  } = useGetSentPostsQuery(sentCursor ? { cursor: sentCursor } : undefined, {
    // Not fetched until the tab is opened: most visits never look at history,
    // and the query is a second round trip on a page that already made one.
    skip: view !== "sent",
  });
  /** A post that just changed time, so its row can say so where someone is looking. */
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  // Which shelf of the queue is showing. Owned here rather than inside the list
  // because the tab bar renders in the sticky header above it.
  const filters = usePostFilters(data?.posts ?? []);

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
 
    if (postsFull) {
      notify.error(
        `This workspace can hold ${scheduledPosts?.quota} scheduled post${scheduledPosts?.quota === 1 ? "" : "s"} at once. Publish, delete or upgrade to add another.`,
      );
      return;
    }
    setEditing(null);
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
        {
          value: "sent",
          label: (
            <Group gap={6} wrap="nowrap" justify="center">
              <Send size={15} />
              <span>Sent</span>
            </Group>
          ),
        },
      ]}
      value={view}
      onChange={(v) => {
        const next = v as "calendar" | "list" | "sent";
        // Opening the tab starts from the newest page. Keeping a cursor from a
        // previous visit would silently skip everything published since.
        if (next === "sent") setSentCursor(undefined);
        setView(next);
      }}
    />
  );

  return (
    <AppShell>

      <Box className="page-header--sticky">
      <Group justify="space-between" align="center" wrap="wrap" gap="md" mb="md">
        <div style={{ minWidth: 0 }}>
          <Title order={2} lh={1.2}>Social posts</Title>
          <Text size="sm" c="dimmed" mt={4}>
            {view === "sent"
              ? "Everything you've published from here"
              : ready
                ? `Publishing to LinkedIn · ${timezone}`
                : "No account connected yet"}
          </Text>
        </div>

        <Group gap="sm" wrap="nowrap" align="center">

          {scheduledPosts && scheduledPosts.used >= scheduledPosts.quota - 1 && (
            <Text size="xs" c={postsFull ? "orange" : "dimmed"} ta="right">
              {scheduledPosts.used} of {scheduledPosts.quota} scheduled
            </Text>
          )}


          {viewControl}

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

 
      {!isLoading && posts.length > 0 && view === "list" && (
        <PostFilters
          filter={filters.filter}
          onFilter={filters.setFilter}
          counts={filters.counts}
        />
      )}
      </Box>

      {/* Not on the Sent tab: it reads history, which stands whether or not the
          connection is currently live, and a prompt to reconnect above a list
          of posts that plainly went out reads as though they had not. */}
      {!isLoading && !ready && view !== "sent" && (
        <ConnectPrompt
          linkedin={linkedin}
          needsPostingPermission={needsPostingPermission}
          connecting={connecting}
          onConnect={connect}
        />
      )}

      {/* Checked before the loader and the empty state, both of which speak for
          the schedule list: history is its own collection, and an account with
          no schedules left can still have published a great deal. */}
      {view === "sent" ? (
        <SentTimeline
          posts={sent?.posts ?? []}
          author={sent?.author?.name || linkedin?.name || ""}
          authorPicture={sent?.author?.picture}
          statsAvailable={sent?.statsAvailable ?? false}
          loading={sentLoading}
          loadingMore={sentFetching && !sentLoading}
          hasMore={Boolean(sent?.nextCursor)}
          onLoadMore={() => setSentCursor(sent?.nextCursor ?? undefined)}
        />
      ) : isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : posts.length === 0 ? (
        <PostsEmptyState disabled={!ready} onCreate={() => openNew()} />
      ) : view === "calendar" ? (
        <Box className="post-calendar-scroll">
          <PostCalendar posts={posts} onOpen={openEdit} onCreateOn={openNew} />
        </Box>
      ) : (
        <PostQueue
          author={linkedin?.name ?? ""}
          onEdit={openEdit}
          onToggle={toggle}
          onDelete={destroy}
          onPublish={publishNow}
 
          onCreate={ready && !postsFull ? openAt : undefined}
          publishingId={publishingId}
          recentlyMovedId={recentlyMovedId}
          filters={filters}
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
