import { Box, Button, Card, Stack, Text } from "@mantine/core";
import { Inbox } from "lucide-react";
import { DELIVERY_WINDOW_MINUTES } from "./draft";
import { PostFilters } from "./PostFilters";
import { PostRow } from "./PostRow";
import { usePostFilters } from "../hooks/usePostFilters";
import { dayLabel } from "../postTime";
import type { ScheduledPost } from "@/shared/types";

/**
 * The queue: what is going out, when, in the order it will happen.
 *
 * Grouped by day rather than listed flat, because that is the question someone
 * opens this page with — "what publishes this week?" — and a content calendar
 * is unreadable as an undifferentiated list. Posts already published fall to
 * the bottom: they are history, not schedule.
 *
 * A container only. Rows, the stat strip, the filter bar and the filtering
 * itself each live in their own file.
 */
export function PostQueue({
  posts,
  author,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  publishingId,
  recentlyMovedId,
}: {
  posts: ScheduledPost[];
  /** The connected account these publish as, shown on each card. */
  author: string;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
}) {
  const handlers = { author, onEdit, onToggle, onDelete, onPublish, publishingId, recentlyMovedId };
  const { filter, setFilter, query, setQuery, counts, visible } = usePostFilters(posts);

  // Waiting posts lead, in the order they will run; history follows, most
  // recent first. Repeating posts belong to no single day, so they sit apart
  // rather than reappearing under whichever one is next.
  const upcoming = visible
    .filter((p) => p.mode !== "repeat" && p.status !== "sent")
    .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt));
  const repeating = visible.filter((p) => p.mode === "repeat");
  const sent = visible
    .filter((p) => p.mode !== "repeat" && p.status === "sent")
    .sort((a, b) => +new Date(b.lastRunAt ?? 0) - +new Date(a.lastRunAt ?? 0));

  const days: { label: string; posts: ScheduledPost[] }[] = [];
  for (const post of upcoming) {
    const label = dayLabel(post.nextRunAt);
    const last = days[days.length - 1];
    if (last?.label === label) last.posts.push(post);
    else days.push({ label, posts: [post] });
  }

  return (
    <Stack gap="lg">
      {/* No summary strip above the tabs: the tab counts already are the
          summary, and stating the same four numbers twice on one screen made
          the page busier without telling anyone anything new. */}

      <PostFilters
        filter={filter}
        onFilter={setFilter}
        query={query}
        onQuery={setQuery}
        counts={counts}
      />

      {visible.length === 0 ? (
        /* Said in place rather than by the tab vanishing: every filter stays
           on screen, so the one that is empty has to say so itself. */
        <Card withBorder padding="xl" radius="md">
          <Stack gap={6} align="center">
            <Inbox size={26} strokeWidth={1.5} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text fw={600} mt={4}>
              {query ? "No posts match that search" : "No posts here"}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {query
                ? "Try a shorter search, or clear it to see everything."
                : "Nothing in this filter yet. Pick another to see the rest of your posts."}
            </Text>
            {query && (
              <Button variant="default" size="compact-sm" mt={4} onClick={() => setQuery("")}>
                Clear search
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <Stack gap="lg">
          {days.map((day) => (
            <Section key={day.label} title={day.label}>
              {day.posts.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          ))}

          {repeating.length > 0 && (
            /* The heading is dropped when the active filter already says the
               same word — the label repeated twice tells nobody anything. */
            <Section title={filter === "repeating" ? null : "Repeating"}>
              {repeating.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          )}

          {sent.length > 0 && (
            <Section title={filter === "published" ? null : "Published"} dim>
              {sent.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          )}
        </Stack>
      )}

      {/* Stated once at the foot rather than on every row: someone reading a
          list of exact-looking times needs this, but reading it a dozen times
          over is how a caveat starts being skipped. */}
      {(upcoming.length > 0 || repeating.length > 0) && (
        <Text size="xs" c="dimmed">
          Scheduled posts publish within {DELIVERY_WINDOW_MINUTES} minutes of their time, never
          before it.
        </Text>
      )}
    </Stack>
  );
}

/** One day, or one shelf, with its rows. */
function Section({
  title,
  dim,
  children,
}: {
  title: string | null;
  dim?: boolean;
  children: React.ReactNode;
}) {
  // The day sits above its own slots and lines up with the card column rather
  // than the page edge, so the eye follows one left margin down the schedule.
  const [lead, ...rest] = title?.split(", ") ?? [];

  return (
    <Box>
      {title && (
        <Text className="post-day" size="sm" c={dim ? "dimmed" : undefined}>
          <strong>{lead}</strong>
          {rest.length > 0 && <span>, {rest.join(", ")}</span>}
        </Text>
      )}
      <Stack gap="xs">{children}</Stack>
    </Box>
  );
}
