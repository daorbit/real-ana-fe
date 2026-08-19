import { useMemo, useState } from "react";
import { Box, Button, Card, Stack, Text } from "@mantine/core";
import { Inbox } from "lucide-react";
import { DELIVERY_WINDOW_MINUTES } from "./draft";
import { PostFilters } from "./PostFilters";
import { PostRow } from "./PostRow";
import { PostSlotEmpty } from "./PostSlotEmpty";
import { usePostFilters } from "../hooks/usePostFilters";
import { dayLabel, daySlots } from "../postTime";
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
  onCreate,
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
  /** Opens the composer on a free slot. Absent when nothing can be scheduled. */
  onCreate?: (at: string) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
}) {
  const handlers = { author, onEdit, onToggle, onDelete, onPublish, publishingId, recentlyMovedId };
  const { filter, setFilter, counts, visible } = usePostFilters(posts);

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

  /**
   * How far ahead the queue is drawn, in days from today.
   *
   * The schedule has no natural end — every future day has free slots — so
   * without a horizon the page grows a tail as long as the calendar and the
   * scrollbar stops meaning anything. A fortnight is the span someone plans
   * over; past that, days are added a fortnight at a time on request.
   */
  const HORIZON_STEP = 14;
  const [horizon, setHorizon] = useState(HORIZON_STEP);

  const days = useMemo(() => {
    const byDay = new Map<string, ScheduledPost[]>();
    for (const post of upcoming) {
      const key = new Date(post.nextRunAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), post]);
    }

    // Every day in the window, not only the ones holding posts: the empty days
    // are the point of a queue view, and skipping them would make a fortnight
    // with two posts render as two rows.
    const out: { label: string; posts: ScheduledPost[]; date: string }[] = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < horizon; i++) {
      const key = cursor.toDateString();
      const iso = cursor.toISOString();
      out.push({ label: dayLabel(iso), posts: byDay.get(key) ?? [], date: iso });
      byDay.delete(key);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Anything scheduled beyond the horizon still has to appear — a post that
    // exists but is not on the page reads as a post that was lost.
    for (const [key, dayPosts] of byDay) {
      const iso = new Date(key).toISOString();
      out.push({ label: dayLabel(iso), posts: dayPosts, date: iso });
    }

    return out.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [upcoming, horizon]);

  /** Whether drawing further ahead would actually add anything. */
  const canExtend = horizon < 365;

  /**
   * A day's posts and its free slots, in the order the clock runs.
   *
   * A slot is dropped once a post sits close to it: two entries an inch apart
   * saying "1:00 PM" and "1:24 PM" read as a duplicate rather than as a gap,
   * and the post is the one that matters. Past slots are dropped too — an
   * invitation to schedule something for an hour that has already gone is one
   * nobody can accept.
   */
  const entriesFor = (day: { posts: ScheduledPost[]; date: string }) => {
    const taken = day.posts.map((p) => +new Date(p.nextRunAt));
    const free = daySlots(day.date).filter((slot) => {
      const at = +new Date(slot);
      return at > Date.now() && !taken.some((t) => Math.abs(t - at) < 45 * 60 * 1000);
    });

    return [
      ...day.posts.map((post) => ({ at: +new Date(post.nextRunAt), post, slot: null })),
      ...free.map((slot) => ({ at: +new Date(slot), post: null, slot })),
    ].sort((a, b) => a.at - b.at);
  };

  return (
    <Stack gap="lg">
   

      <PostFilters filter={filter} onFilter={setFilter} counts={counts} />

      {visible.length === 0 && filter !== "queue" ? (

        <Card withBorder padding="xl" radius="md">
          <Stack gap={6} align="center">
            <Inbox size={26} strokeWidth={1.5} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text fw={600} mt={4}>
              {filter === "approvals" ? "Approvals are not set up yet" : "No posts here"}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {filter === "approvals"
                ? "Posts sent for review will wait here before they publish."
                : "Nothing on this shelf yet. Pick another tab to see the rest of your posts."}
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack className="post-timeline" gap="lg">
   
          {days.map((day) => {
            const entries = filter === "queue"
              ? entriesFor(day)
              : day.posts.map((post) => ({
                  at: +new Date(post.nextRunAt), post, slot: null as string | null,
                }));

            // A day that offers nothing is not drawn at all. Today's slots run
            // out as the day does, and a heading with nothing under it reads as
            // a rendering fault rather than as a full day.
            if (entries.length === 0) return null;

            return (
              <Section key={day.date} title={day.label}>
                {entries.map((entry) => (
                  entry.post
                    ? <PostRow key={entry.post.id} post={entry.post} {...handlers} />
                    : <PostSlotEmpty
                        key={entry.slot}
                        at={entry.slot!}
                        disabled={!onCreate}
                        onCreate={(at) => onCreate?.(at)}
                      />
                ))}
              </Section>
            );
          })}

          {/* The horizon is extended on request rather than by scrolling: an
              endless list that grows as you reach the bottom never lets anyone
              get to the foot of the page, and the queue has a foot worth
              reaching. */}
          {filter === "queue" && canExtend && (
            <Button
              className="post-timeline-more"
              variant="default"
              size="compact-sm"
              onClick={() => setHorizon((d) => d + HORIZON_STEP)}
            >
              Show {HORIZON_STEP} more days
            </Button>
          )}

          {repeating.length > 0 && (
            /* The heading is dropped when the active filter already says the
               same word — the label repeated twice tells nobody anything. */
            <Section title="Repeating">
              {repeating.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          )}

          {sent.length > 0 && (
            /* The Sent tab is nothing but published posts, so the heading there
               would repeat the tab's own word back at the reader. */
            <Section title={filter === "sent" ? null : "Published"} dim>
              {sent.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          )}
        </Stack>
      )}

      {/* Stated once at the foot rather than on every row: someone reading a
          list of exact-looking times needs this, but reading it a dozen times
          over is how a caveat starts being skipped. */}
      {(upcoming.length > 0 || repeating.length > 0 || filter === "queue") && (
        <Text className="post-timeline-note" size="xs" c="dimmed">
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
        <Text className="post-day" c={dim ? "dimmed" : undefined}>
          <strong>{lead}</strong>
          {rest.length > 0 && <span>, {rest.join(", ")}</span>}
        </Text>
      )}
      <Stack gap="xs">{children}</Stack>
    </Box>
  );
}
