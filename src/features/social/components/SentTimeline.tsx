import { useMemo } from "react";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { CheckCircle2, Send } from "lucide-react";
import { SentPostRow } from "./SentPostRow";
import { dayLabel } from "../postTime";
import { SocialPostsSkeleton } from "@/shared/ui/Skeletons";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { SentPost } from "@/shared/types";

/**
 * Published posts, newest first, grouped by the day they went out.
 *
 * Grouped the same way the queue groups upcoming posts, and with the same
 * headings, because it is the same timeline read in the other direction: what
 * has happened rather than what is about to. The one structural difference is
 * that this list has no empty slots — a day with no posts simply is not there,
 * since there is nothing to schedule into the past.
 */
export function SentTimeline({
  posts,
  author,
  authorPicture,
  statsAvailable,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  emptyState = "sent",
  onScheduleAgain,
}: {
  posts: SentPost[];
  author: string;
  authorPicture?: string;
  statsAvailable: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  /**
   * What an empty list means here.
   *
   * The same list of runs serves two shelves, and nothing is not the same news
   * on both: no published posts is a beginning, no failed ones is a relief, and
   * `"none"` is for where something else on the page already speaks.
   */
  emptyState?: "sent" | "failed" | "none";
  /** Send a failed post's content again, as a new one-off. */
  onScheduleAgain?: (post: SentPost) => void;
}) {
  // Newest first. The server already sorts, but grouping has to preserve it and
  // an explicit sort here means a reordered response cannot scramble the days.
  const days = useMemo(() => {
    const byDay = new Map<string, SentPost[]>();
    for (const post of [...posts].sort(
      (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
    )) {
      const key = new Date(post.publishedAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), post]);
    }
    return [...byDay.entries()].map(([key, dayPosts]) => ({
      key,
      label: dayLabel(new Date(key).toISOString()),
      posts: dayPosts,
    }));
  }, [posts]);

  if (loading) {
    return <SocialPostsSkeleton />;
  }

  if (posts.length === 0) {
    if (emptyState === "none") return null;
    return emptyState === "failed" ? (
      <EmptyState
        icon={CheckCircle2}
        title="Nothing has failed"
        description="Every post has gone out as scheduled. Any that don't will appear here with the reason it stopped."
      />
    ) : (
      <EmptyState
        icon={Send}
        title="Nothing published yet"
        description="Posts you publish from here — on a schedule or by hand — appear in this list once they go out."
      />
    );
  }

  return (
    <Stack gap="lg">
      {/* Nothing is said about missing engagement figures, because nothing
          claims to show them: where analytics are unavailable the rows omit
          the statistics entirely, and a banner explaining the absence of
          something the reader cannot see is an apology for a gap they were
          never shown. `statsAvailable` still travels to the rows, which use it
          to decide whether to render figures at all. */}

      <Stack className="post-timeline" gap={34}>
        {days.map((day) => (
          <Box key={day.key}>
            <Text className="post-day">
              <strong>{day.label.split(", ")[0]}</strong>
              {day.label.includes(", ") && <span>, {day.label.split(", ").slice(1).join(", ")}</span>}
            </Text>
            <Stack gap={10}>
              {day.posts.map((post) => (
                <SentPostRow
                  key={post.id}
                  post={post}
                  author={author}
                  authorPicture={authorPicture}
                  statsAvailable={statsAvailable}
                  onScheduleAgain={onScheduleAgain}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Explicit rather than an infinite scroll: history has no end worth
          racing to, and a button that says how to see more beats a list that
          silently grows while someone is reading it. */}
      {hasMore && (
        <Group justify="center" pb="md">
          <Button variant="default" loading={loadingMore} onClick={onLoadMore}>
            Load older posts
          </Button>
        </Group>
      )}
    </Stack>
  );
}
