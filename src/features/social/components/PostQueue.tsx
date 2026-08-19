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
  author: string;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  onCreate?: (at: string) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
}) {
  const handlers = { author, onEdit, onToggle, onDelete, onPublish, publishingId, recentlyMovedId };
  const { filter, setFilter, counts, visible } = usePostFilters(posts);


  const upcoming = visible
    .filter((p) => p.mode !== "repeat" && p.status !== "sent")
    .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt));
  const repeating = visible.filter((p) => p.mode === "repeat");
  const sent = visible
    .filter((p) => p.mode !== "repeat" && p.status === "sent")
    .sort((a, b) => +new Date(b.lastRunAt ?? 0) - +new Date(a.lastRunAt ?? 0));

 
  const HORIZON_STEP = 14;
  const [horizon, setHorizon] = useState(HORIZON_STEP);

  const days = useMemo(() => {
    const byDay = new Map<string, ScheduledPost[]>();
    for (const post of upcoming) {
      const key = new Date(post.nextRunAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), post]);
    }


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

 
    for (const [key, dayPosts] of byDay) {
      const iso = new Date(key).toISOString();
      out.push({ label: dayLabel(iso), posts: dayPosts, date: iso });
    }

    return out.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [upcoming, horizon]);

  const canExtend = horizon < 365;

 
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
            
            <Section title={filter === "sent" ? null : "Published"} dim>
              {sent.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
            </Section>
          )}
        </Stack>
      )}

      {(upcoming.length > 0 || repeating.length > 0 || filter === "queue") && (
        <Text className="post-timeline-note" size="xs" c="dimmed">
          Scheduled posts publish within {DELIVERY_WINDOW_MINUTES} minutes of their time, never
          before it.
        </Text>
      )}
    </Stack>
  );
}

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
