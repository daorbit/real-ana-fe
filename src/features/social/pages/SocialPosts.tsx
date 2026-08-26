import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon, Box, Button, Group, SegmentedControl, Stack, Text, Title, Tooltip,
} from "@mantine/core";
import { CalendarDays, List as ListIcon, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { modals } from "@mantine/modals";
import { notify, notifyError } from "@/shared/lib/notify";
import { usePostFilters } from "@/features/social/hooks/usePostFilters";
import { PostFilters } from "@/features/social/components/PostFilters";
import {
  useDeleteSentPostMutation, useGetScheduledPostsQuery, useGetSentPostsQuery,
  useGetWorkspaceUsageQuery,
} from "@/app/store";
import { useLinkedInConnect } from "@/features/social/useLinkedInConnect";
import { useInstagramConnect } from "@/features/social/useInstagramConnect";
import { usePostActions } from "@/features/social/hooks/usePostActions";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { PaneTab } from "@/features/social/components/ComposerPreviewPane";
import { ConnectPrompt } from "@/features/social/components/ConnectPrompt";
import { PostComposer } from "@/features/social/components/PostComposer";
import { PostCalendar } from "@/features/social/components/PostCalendar";
import { PostQueue } from "@/features/social/components/PostQueue";
import { PostsEmptyState } from "@/features/social/components/PostsEmptyState";
import { SocialPostsSkeleton } from "@/shared/ui/Skeletons";
import { SentTimeline } from "@/features/social/components/SentTimeline";
import {
  draftFromPost, draftFromRun, emptyDraft, toDateInput, type Draft,
} from "@/features/social/components/draft";
import type { PostAccount, ScheduledPost, SentPost } from "@/shared/types";

 
export default function SocialPosts() {
  const { active } = useWorkspace();
  const { user } = useAuth();
  const { data, isLoading, isFetching, refetch } = useGetScheduledPostsQuery();
 
  const { data: usage } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });
  const scheduledPosts = usage?.scheduledPosts;
  const postsFull = !!scheduledPosts && scheduledPosts.used >= scheduledPosts.quota;

  const [deleteSent] = useDeleteSentPostMutation();
  /** Which Sent row is being removed, so only that one spins. */
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [composing, setComposing] = useState(false);
  /** Which half of the composer's right pane is showing. */
  const [pane, setPane] = useState<PaneTab>("preview");

  const [editing, setEditing] = useState<ScheduledPost | null>(null);
 
  const [initial, setInitial] = useState<Draft>(emptyDraft);
 
  // How the posts are laid out, which is a separate question from which posts
  // are being shown — that is the shelf, below.
  const [view, setView] = useState<"calendar" | "list">("list");

  // Which shelf of the queue is showing. Owned here rather than inside the list
  // because the tab bar renders in the sticky header above it.
  const filters = usePostFilters(data?.posts ?? []);
  const onSent = filters.filter === "sent";
  const onFailed = filters.filter === "failed";

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
    refetch: refetchSent,
  } = useGetSentPostsQuery(
    {
      ...(sentCursor ? { cursor: sentCursor } : {}),
      ...(onFailed ? { status: "failed" as const } : {}),
    },
    {
      // Not fetched until one of the two shelves that read runs is opened:
      // most visits never look at history, and the query is a second round
      // trip on a page that already made one.
      skip: !onSent && !onFailed,
    },
  );
  /** A post that just changed time, so its row can say so where someone is looking. */
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  // Connecting happens in a popup, so this page — and any half-written draft —
  // survives the round trip. Disconnecting is not offered here: it lives with
  // the connection's own settings rather than on the page that depends on it.
  const { connect, connecting } = useLinkedInConnect(refetch);
  const { connect: connectInstagram, connecting: connectingInstagram } =
    useInstagramConnect(refetch);

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
  const instagram = data?.instagram;
  /** Whether an account can actually publish: connected, live, and granted. */
  const usable = (account?: PostAccount) =>
    Boolean(account?.connected && !account.expired && account.canPublish !== false);
  // Either network is enough to start composing — the picker in the composer
  // chooses between them. Gating on LinkedIn alone would lock out someone who
  // connected only Instagram.
  const ready = usable(linkedin) || usable(instagram);

  /**
   * A blank draft, aimed at a network the user can actually publish to.
   *
   * LinkedIn stays the default where both are connected — it is the older
   * integration and the one most schedules target — but someone who connected
   * only Instagram should not have to change the picker on every new post.
   */
  /**
   * The networks that can publish right now, named for the page subtitle.
   *
   * Reads from what is actually usable rather than saying "LinkedIn" outright:
   * with only Instagram connected, naming LinkedIn is simply wrong.
   */
  const connectedNames = [
    usable(linkedin) ? "LinkedIn" : "",
    usable(instagram) ? "Instagram" : "",
  ].filter(Boolean).join(" and ");

  const newDraft = (): Draft => ({
    ...emptyDraft(),
    provider: !usable(linkedin) && usable(instagram) ? "instagram" : "linkedin",
  });

  const openNew = (date?: string) => {
 
    if (postsFull) {
      notify.error(
        `This workspace can hold ${scheduledPosts?.quota} scheduled post${scheduledPosts?.quota === 1 ? "" : "s"} at once. Publish, delete or upgrade to add another.`,
      );
      return;
    }
    setEditing(null);
    setInitial({ ...newDraft(), ...(date ? { date } : {}) });
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
      ...newDraft(),
      date: toDateInput(slot),
      time: `${pad(slot.getHours())}:${pad(slot.getMinutes())}`,
    });
    setComposing(true);
  };

  /**
   * Send a past run's content again, as a new post.
   *
   * A new schedule rather than a revived one: the run is history, and the post
   * that produced it may have been deleted or moved on since. The composer
   * opens with the words and image already in it, at the next free slot, so the
   * only thing left to decide is when.
   */
  const scheduleAgain = (run: SentPost) => {
    if (postsFull) {
      notify.error(
        `This workspace can hold ${scheduledPosts?.quota} scheduled post${scheduledPosts?.quota === 1 ? "" : "s"} at once. Publish, delete or upgrade to add another.`,
      );
      return;
    }
    setEditing(null);
    setInitial(draftFromRun(run));
    setComposing(true);
  };

  /**
   * Remove a row from the Sent history.
   *
   * Confirmed first, and the dialog is explicit about the half people assume:
   * the post stays up on the network. Someone reaching for a delete button in
   * a list of published posts may well mean "take it down", and finding out
   * afterwards that it is still live is the worse of the two surprises.
   */
  const removeSent = (post: SentPost) => {
    modals.openConfirmModal({
      title: "Remove from this list?",
      centered: true,
      radius: "lg",
      children: (
        <Text size="sm" c="dimmed">
          This removes the record from Quantalog. The post itself stays on{" "}
          {post.provider === "instagram" ? "Instagram" : "LinkedIn"} — delete it
          there if you want it taken down.
        </Text>
      ),
      labels: { confirm: "Remove", cancel: "Keep" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        trace(user?.id, "delete_sent_post", "sent_timeline", "post_removed");
        setRemovingId(post.id);
        try {
          await deleteSent(post.id).unwrap();
          notify.success("Removed from your history.");
        } catch (e) {
          notifyError(e, "Could not remove that post.");
        } finally {
          setRemovingId(null);
        }
      },
    });
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

  // Opening a shelf starts from the newest page. A cursor left over from a
  // previous visit — or from the other run-backed shelf, which pages through a
  // different list — would silently skip everything since.
  const onFilter = (next: typeof filters.filter) => {
    setSentCursor(undefined);
    filters.setFilter(next);
  };

  return (
    <AppShell>

      <Box className="page-header--sticky">
      <Group justify="space-between" align="center" wrap="wrap" gap="md" mb="md">
        <div style={{ minWidth: 0 }}>
          <Title order={2} lh={1.2}>Social posts</Title>
          <Text size="sm" c="dimmed" mt={4}>
            {onSent
              ? "Everything you've published from here"
              : ready
                ? `Publishing to ${connectedNames} · ${timezone}`
                : "No account connected yet"}
          </Text>
        </div>

        <Group gap="sm" wrap="nowrap" align="center">

          {scheduledPosts && scheduledPosts.used >= scheduledPosts.quota - 1 && (
            <Text size="xs" c={postsFull ? "orange" : "dimmed"} ta="right">
              {scheduledPosts.used} of {scheduledPosts.quota} scheduled
            </Text>
          )}


          {/* Hidden on the two shelves that read runs: neither has empty slots
              to lay out on a calendar, so the switch there would offer a view
              that cannot be drawn. */}
          {!onSent && !onFailed && viewControl}

          {/* Whatever is currently on screen, re-read. Worth its own control
              because the two things most likely to be stale here happen
              elsewhere: a scheduled post publishes on the server's clock, and
              a reconnected LinkedIn account clears a failure — neither of
              which this page hears about while it sits open. */}
          <Tooltip label={onSent ? "Refresh published posts" : "Refresh"} withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Refresh"
              loading={onSent || onFailed ? sentFetching : isFetching}
              onClick={() => {
                // The Failed shelf reads both collections at once, so it
                // refreshes both — refreshing only the half someone happens to
                // be looking at leaves the other stale under the same button.
                if (!onSent) refetch();
                if (onSent || onFailed) {
                  // From the newest page: a refresh that kept a cursor from a
                  // previous "load older" would re-read the middle of history
                  // and leave the newest posts exactly as stale as before.
                  if (sentCursor) setSentCursor(undefined);
                  else refetchSent();
                }
              }}
            >
              <RefreshCw size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label={!ready ? "Connect an account first" : "This workspace's scheduled posts are full"}
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

      {/* Shown while loading too, with the counts it already has — zero for
          every shelf. A tab bar that appears only once the list lands pushes
          the whole timeline down at the moment it arrives, which is the jump
          the skeleton exists to prevent. */}
      {(isLoading || posts.length > 0 || onSent || onFailed) && view === "list" && (
        <PostFilters
          filter={filters.filter}
          onFilter={onFilter}
          counts={filters.counts}
        />
      )}
      </Box>

      {/* Not on the Sent shelf: it reads history, which stands whether or not
          the connection is currently live, and a prompt to reconnect above a
          list of posts that plainly went out reads as though they had not. */}
      {!isLoading && !ready && !onSent && (
        <ConnectPrompt
          linkedin={linkedin}
          instagram={instagram}
          connecting={connecting || connectingInstagram}
          onConnect={() => {
            trace(user?.id, "connect_linkedin", "social_posts", "linkedin_oauth_popup");
            connect();
          }}
          onConnectInstagram={() => {
            trace(user?.id, "connect_instagram", "social_posts", "instagram_oauth_popup");
            connectInstagram();
          }}
        />
      )}

      {/* Checked before the loader and the empty state, both of which speak for
          the schedule list: history is its own collection, and an account with
          no schedules left can still have published a great deal. */}
      {onSent ? (
        <SentTimeline
          posts={sent?.posts ?? []}
          author={sent?.author?.name || linkedin?.name || ""}
          authorPicture={sent?.author?.picture}
          instagramAuthor={instagram?.name ? `@${instagram.name}` : ""}
          instagramPicture={instagram?.picture}
          statsAvailable={sent?.statsAvailable ?? false}
          loading={sentLoading}
          loadingMore={sentFetching && !sentLoading}
          hasMore={Boolean(sent?.nextCursor)}
          onLoadMore={() => setSentCursor(sent?.nextCursor ?? undefined)}
          onDelete={removeSent}
          deletingId={removingId}
        />
      ) : onFailed ? (
        /*
         * Two collections, one shelf.
         *
         * A post can fail in two ways that are stored quite differently: a
         * *schedule* whose last attempt failed still sits in the queue awaiting
         * another, while an attempt that failed outright is a run — a record of
         * one moment, with no future. Someone asking "what went wrong?" means
         * both, and would not think to look in two places for them.
         *
         * Schedules come first: they are the ones still fixable.
         */
        <Stack gap="xl">
          {filters.visible.length > 0 && (
            <PostQueue
              author={linkedin?.name ?? ""}
              authorPicture={linkedin?.picture}
              instagramAuthor={instagram?.name ? `@${instagram.name}` : ""}
              instagramPicture={instagram?.picture}
              onEdit={openEdit}
              onToggle={toggle}
              onDelete={destroy}
              onPublish={publishNow}
              publishingId={publishingId}
              recentlyMovedId={recentlyMovedId}
              filters={filters}
            />
          )}
          <SentTimeline
            posts={sent?.posts ?? []}
            author={sent?.author?.name || linkedin?.name || ""}
            authorPicture={sent?.author?.picture}
            instagramAuthor={instagram?.name ? `@${instagram.name}` : ""}
            instagramPicture={instagram?.picture}
            statsAvailable={sent?.statsAvailable ?? false}
            loading={sentLoading}
            loadingMore={sentFetching && !sentLoading}
            hasMore={Boolean(sent?.nextCursor)}
            onLoadMore={() => setSentCursor(sent?.nextCursor ?? undefined)}
          onDelete={removeSent}
          deletingId={removingId}
            // Suppressed where a schedule above already reports a failure: the
            // shelf is not empty, and "nothing has failed" beneath a post that
            // plainly did contradicts it.
            emptyState={filters.visible.length > 0 ? "none" : "failed"}
            onScheduleAgain={ready ? scheduleAgain : undefined}
          />
        </Stack>
      ) : isLoading ? (
        <SocialPostsSkeleton />
      ) : posts.length === 0 ? (
        <PostsEmptyState disabled={!ready} onCreate={() => openNew()} />
      ) : view === "calendar" ? (
        <Box className="post-calendar-scroll">
          <PostCalendar posts={posts} onOpen={openEdit} onCreateOn={openNew} />
        </Box>
      ) : (
        <PostQueue
          author={linkedin?.name ?? ""}
          authorPicture={linkedin?.picture}
          instagramAuthor={instagram?.name ? `@${instagram.name}` : ""}
          instagramPicture={instagram?.picture}
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
        pane={pane}
        onPane={setPane}
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
