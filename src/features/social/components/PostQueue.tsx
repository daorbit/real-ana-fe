import { useMemo, useState } from "react";
import {
  Badge, Box, Button, Card, CloseButton, Group, SimpleGrid, Stack, Tabs, Text, TextInput, Tooltip,
} from "@mantine/core";
import {
  CheckCircle2, ExternalLink, ImageOff, Pause, Pencil, Play, Repeat, Search, Send, Trash2,
  TriangleAlert,
} from "lucide-react";
import { DELIVERY_WINDOW_MINUTES, WEEKDAYS } from "./draft";
import { LINKEDIN_BLUE, LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { ScheduledPost } from "@/shared/types";

/**
 * The queue: what is going out, when, in the order it will happen.
 *
 * Grouped by day rather than listed flat, because that is the question someone
 * opens this page with — "what publishes this week?" — and a content calendar
 * is unreadable as an undifferentiated list. Posts already published fall to
 * their own section at the bottom: they are history, not schedule.
 */

/** "Every week on Monday at 09:00" — a repeating post's cadence, from the row. */
function cadence(post: ScheduledPost): string {
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
}

/** "Today", "Tomorrow", or the date — the heading a group sits under. */
function dayLabel(iso: string): string {
  const at = new Date(iso);
  const days = Math.round(
    (new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return at.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
    // The year only when it is not this one, which is how people write dates.
    year: at.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/**
 * "Tomorrow, 09:00" — the day as well as the time.
 *
 * The day heading above a row is not enough on its own: editing a post
 * reorders the queue, and a row showing only "09:00" looks identical wherever
 * it lands, so a post that moved to another day reads as unchanged. Carrying
 * the day on the row itself is what makes the move visible.
 */
function timeLabel(iso: string): string {
  const at = new Date(iso);
  const time = at.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const days = Math.round(
    (new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  // Short form, because the heading above already carries the long one; this
  // is here so the row still reads correctly on its own.
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  const date = at.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  return `${date}, ${time}`;
}

function PostRow({
  post,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  publishingId,
  recentlyMovedId,
}: {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  /** The row currently publishing, so only its own button spins. */
  publishingId: string | null;
  /** The post whose time just changed, so its row can say where it went. */
  recentlyMovedId?: string | null;
}) {
  const publishing = publishingId === post.id;
  const repeating = post.mode === "repeat";
  const sent = post.status === "sent";
  const moved = recentlyMovedId === post.id;


  const draft = post.status === "paused";

  return (
    <Card
      withBorder
      padding={0}
      radius="md"
      // The app sets a fixed Card padding globally with `!important`, which
      // both the `padding` prop and an inline style lose to. This card's image
      // has to reach its own border, so it opts out through a class of its own.
      className="post-card"
      style={{
        opacity: sent ? 0.75 : 1,
        display: "flex",
        flexDirection: "column",
        borderColor: moved ? "var(--accent)" : undefined,
        transition: "border-color 200ms ease",
        overflow: "hidden",
      }}
    >

      <Box
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          flexShrink: 0,
          background: "var(--mantine-color-default)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--mantine-color-dimmed)",
            }}
          >
            <ImageOff size={26} strokeWidth={1.5} />
          </Box>
        )}

        {/* Status reads on the image, the way a feed post shows a badge over
            its thumbnail, so it is visible without reading a word of text. */}
        <Group gap={6} style={{ position: "absolute", top: 8, left: 8 }} wrap="wrap">
          {sent ? (
            <Badge size="sm" variant="filled" color="gray">Published</Badge>
          ) : draft ? (
            <Badge size="sm" variant="filled" color="gray">Draft</Badge>
          ) : (
            <Badge size="sm" variant="filled" color="teal">Scheduled</Badge>
          )}
          {repeating && (
            <Badge size="sm" variant="filled" color="orange" leftSection={<Repeat size={11} />}>
              Repeats
            </Badge>
          )}
        </Group>

        {moved && (
          <Badge
            size="sm"
            variant="filled"
            style={{ position: "absolute", top: 8, right: 8 }}
          >
            Moved here
          </Badge>
        )}

        {/* The network this card publishes to. One mark today; a second
            network will sit beside it here rather than needing a new place
            to live. */}
        <Box
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: 6,
            background: LINKEDIN_BLUE,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
          }}
        >
          <LinkedInMark size={13} color="#fff" />
        </Box>
      </Box>

      {/* Text block grows to fill the space between the image and the pinned
          action bar, so a short caption does not leave the buttons floating
          partway up a tall card. */}
      <Stack gap={6} p="md" style={{ flex: 1, minWidth: 0 }}>
        <Text fw={600} truncate>{post.name}</Text>
        <Text size="sm" c="dimmed" lineClamp={3} style={{ flex: 1 }}>
          {post.caption}
        </Text>

        {/* The scheduled time reads as exact, so the card carries the window
            on hover rather than in the line itself -- the queue footnote
            states it once for anyone who does not hover. Only for posts still
            waiting: a published post has a real time, not an estimate. */}
        <Text size="xs" c="dimmed">
          <Tooltip
            label={`Publishes within ${DELIVERY_WINDOW_MINUTES} minutes of this time`}
            withArrow
            disabled={sent}
          >
            <Text component="span" style={{ cursor: sent ? "default" : "help" }}>
              {repeating ? cadence(post) : timeLabel(post.nextRunAt)}
            </Text>
          </Tooltip>
          {repeating && post.status === "active" && (
            <> · next {new Date(post.nextRunAt).toLocaleString()}</>
          )}
          {/* Only where the count adds information. A one-off card already
              says "Published <date>" below, so a bare "1 published" next to it
              reads as if one post became two. It only earns its place on a
              repeating post, where it is the cadence's running total, or on a
              one-off sent more than once — which only happens by hand, via
              "Post now" on a post already sent, and is worth flagging. */}
          {post.postCount > 0 && (repeating || post.postCount > 1) && (
            <> · {post.postCount} published</>
          )}
        </Text>

        {/* The last outcome, when there was one. A failure carries the reason
            the server already wrote for display. */}
        {post.lastStatus === "failed" && post.lastError && (
          <Group gap={6} wrap="nowrap" align="flex-start">
            <TriangleAlert size={13} style={{ color: "var(--mantine-color-orange-6)", flexShrink: 0, marginTop: 2 }} />
            <Text size="xs" c="orange">{post.lastError}</Text>
          </Group>
        )}
        {post.lastStatus === "ok" && (
          <Group gap={6} wrap="wrap" align="center">
            <CheckCircle2 size={13} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
            <Text size="xs" c="dimmed">
              Published {post.lastRunAt ? new Date(post.lastRunAt).toLocaleString() : ""}
            </Text>
            {post.lastPostUrl && (
              <Button
                component="a"
                href={post.lastPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                size="compact-xs"
                rightSection={<ExternalLink size={12} />}
              >
                View
              </Button>
            )}
          </Group>
        )}
      </Stack>

      {/* Actions pinned to the foot of the card, always in the same place
          whatever the caption length above them. */}
      <Group
        gap={6}
        wrap="nowrap"
        justify="flex-end"
        p="sm"
        style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      >
        {/* An extra send, not a reschedule: the cadence is untouched, so a
            weekly post sent now still goes out on its usual day. Offered on
            sent posts too — republishing an evergreen one by hand is the case
            this exists for. */}
        <Tooltip label="Post now" withArrow>
          <Button
            variant="default"
            size="compact-sm"
            loading={publishing}
            onClick={() => onPublish(post)}
            aria-label="Post now"
          >
            <Send size={14} />
          </Button>
        </Tooltip>
        <Tooltip label={sent ? "Reschedule" : "Edit"} withArrow>
          <Button variant="default" size="compact-sm" onClick={() => onEdit(post)} aria-label="Edit">
            <Pencil size={14} />
          </Button>
        </Tooltip>
        {/* Nothing to pause on a post that has already gone out. */}
        {!sent && (
          <Tooltip label={draft ? "Resume" : "Save as draft"} withArrow>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onToggle(post)}
              aria-label={draft ? "Resume" : "Save as draft"}
            >
              {draft ? <Play size={14} /> : <Pause size={14} />}
            </Button>
          </Tooltip>
        )}
        <Tooltip label="Delete" withArrow>
          <Button variant="default" size="compact-sm" onClick={() => onDelete(post)} aria-label="Delete">
            <Trash2 size={14} />
          </Button>
        </Tooltip>
      </Group>
    </Card>
  );
}

/** The shelves someone actually asks for, in the order they ask. */
const FILTERS = [
  { value: "all", label: "All posts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "repeating", label: "Repeating" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "failed", label: "Failed" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

/**
 * Which shelves a post belongs on. A post can sit on more than one.
 *
 * "Draft" is a UI reading of the server's `paused` status, not a status of its
 * own — see draft.ts. A draft still carries a real date and time; it is
 * writing put on hold, not writing with no time chosen yet.
 */
function matches(post: ScheduledPost, filter: Filter): boolean {
  switch (filter) {
    case "all": return true;
    case "scheduled": return post.mode !== "repeat" && post.status === "active";
    case "repeating": return post.mode === "repeat";
    case "published": return post.status === "sent" || post.postCount > 0;
    case "draft": return post.status === "paused";
    case "failed": return post.lastStatus === "failed";
  }
}

/**
 * A card row that fills the width it is given.
 *
 * `auto-fill` with a `minmax(280px, 1fr)` track rather than a fixed column
 * count: the row fits as many cards as the viewport allows and lets them share
 * the leftover space, so nothing is stretched across a row built for four and
 * nothing is pinned to a narrow sliver beside empty space. See `.post-card-row`.
 */
function ShelfGrid({ children }: { children: React.ReactNode }) {
  return <div className="post-card-row">{children}</div>;
}

/** A headline number with its label. Reads at a glance, above the detail. */
function StatTile({
  value,
  label,
  hint,
  tone,
}: {
  value: number;
  label: string;
  hint: string;
  tone?: string;
}) {
  return (
    <Card withBorder padding="md" radius="md" style={{ minWidth: 0 }}>
      <Text fw={700} fz={28} lh={1.1} c={tone} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="sm" fw={600} mt={6}>{label}</Text>
      <Text size="xs" c="dimmed">{hint}</Text>
    </Card>
  );
}

export function PostQueue({
  posts,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  publishingId,
  recentlyMovedId,
}: {
  posts: ScheduledPost[];
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
}) {
  const handlers = { onEdit, onToggle, onDelete, onPublish, publishingId, recentlyMovedId };

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Counts come from every post, not the filtered set: a tab showing "0" is
  // information, and a count that changed because of the current filter would
  // be a number that means nothing.
  const stats = useMemo(() => ({
    scheduled: posts.filter((p) => matches(p, "scheduled")).length,
    repeating: posts.filter((p) => matches(p, "repeating")).length,
    published: posts.reduce((n, p) => n + p.postCount, 0),
    failed: posts.filter((p) => matches(p, "failed")).length,
  }), [posts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) => matches(p, filter)
        && (!q || p.name.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q)),
    );
  }, [posts, filter, query]);

  // Within a shelf the question is still "what happens next", so waiting posts
  // lead in the order they will run and history follows, most recent first.
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

  const empty = visible.length === 0;

  return (
    <Stack gap="lg">
      {/* A fixed grid rather than flex: tiles that grow to fill the row leave a
          gap wherever the count is odd, and a stat tile stretched to half the
          viewport reads as an empty panel rather than a number. */}
      <SimpleGrid cols={{ base: 2, sm: stats.failed > 0 ? 4 : 3 }} spacing="sm">
        <StatTile
          value={stats.scheduled}
          label="Scheduled"
          hint="waiting to publish"
        />
        <StatTile
          value={stats.repeating}
          label="Repeating"
          hint="on a cadence"
        />
        <StatTile
          value={stats.published}
          label="Published"
          hint="posts sent so far"
          tone="teal"
        />
        {/* Only when there is something wrong: a permanent "0 failed" tile
            spends a quarter of the row on the absence of a problem. */}
        {stats.failed > 0 && (
          <StatTile
            value={stats.failed}
            label="Failed"
            hint="need attention"
            tone="orange"
          />
        )}
      </SimpleGrid>

      {/* Filter and search sit together above the list, because they answer the
          same question -- "show me a subset" -- and separating them makes the
          second one look like a page-wide search. */}
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Tabs value={filter} onChange={(v) => setFilter((v as Filter) ?? "all")} variant="default">
          <Tabs.List>
            {FILTERS.map((f) => {
              const count = f.value === "all"
                ? posts.length
                : posts.filter((p) => matches(p, f.value)).length;
              // An empty shelf that is not the current one is not worth a tab.
              if (count === 0 && f.value !== filter && f.value !== "all") return null;
              return (
                <Tabs.Tab
                  key={f.value}
                  value={f.value}
                  rightSection={
                    <Badge size="xs" variant="light" circle>{count}</Badge>
                  }
                >
                  {f.label}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>

        <TextInput
          placeholder="Search posts"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<Search size={15} />}
          rightSection={
            query ? (
              <CloseButton size="sm" onClick={() => setQuery("")} aria-label="Clear search" />
            ) : null
          }
          w={240}
        />
      </Group>

      {empty ? (
        <Card withBorder padding="xl" radius="md">
          <Stack gap={6} align="center">
            <Text fw={600}>
              {query ? "No posts match that search" : "Nothing on this shelf"}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {query
                ? "Try a shorter search, or clear it to see everything."
                : "Switch to another filter to see the rest of your posts."}
            </Text>
            {query && (
              <Button variant="default" size="compact-sm" mt={4} onClick={() => setQuery("")}>
                Clear search
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <Stack gap="xl">
          {days.map((day) => (
            <div key={day.label}>
              <Text size="sm" fw={700} mb="sm">{day.label}</Text>
              <ShelfGrid>
                {day.posts.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
              </ShelfGrid>
            </div>
          ))}

          {repeating.length > 0 && (
            <div>
              {filter !== "repeating" && (
                <Group gap={7} mb="sm" wrap="nowrap">
                  <Repeat size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
                  <Text size="sm" fw={700}>Repeating</Text>
                </Group>
              )}
              <ShelfGrid>
                {repeating.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
              </ShelfGrid>
            </div>
          )}

          {/* The heading is dropped when the active filter already says the same
              word: "Published" above a grid of published posts, on the
              Published tab, is the label repeated three times. */}
          {sent.length > 0 && (
            <div>
              {filter !== "published" && (
                <Text size="sm" fw={700} mb="sm" c="dimmed">Published</Text>
              )}
              <ShelfGrid>
                {sent.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
              </ShelfGrid>
            </div>
          )}
        </Stack>
      )}

      {/* Stated once at the foot of the queue rather than on every row: someone
          reading a list of exact-looking times needs this, but reading it a
          dozen times over is how a caveat starts being skipped. Only when
          something is actually waiting -- it is irrelevant next to history. */}
      {(upcoming.length > 0 || repeating.length > 0) && (
        <Text size="xs" c="dimmed">
          Scheduled posts publish within {DELIVERY_WINDOW_MINUTES} minutes of their time, never
          before it.
        </Text>
      )}
    </Stack>
  );
}
