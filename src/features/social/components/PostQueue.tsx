import { Badge, Button, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import {
  CheckCircle2, ExternalLink, Pause, Pencil, Play, Repeat, Trash2, TriangleAlert,
} from "lucide-react";
import { WEEKDAYS } from "./draft";
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

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function PostRow({
  post,
  onEdit,
  onToggle,
  onDelete,
}: {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
}) {
  const repeating = post.mode === "repeat";
  const sent = post.status === "sent";

  return (
    <Card withBorder padding="md" radius="md" style={{ opacity: sent ? 0.75 : 1 }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group align="flex-start" gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              style={{ width: 96, height: 54, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <Group gap={8} wrap="nowrap" mb={4}>
              <Text fw={600} truncate>{post.name}</Text>
              {sent ? (
                <Badge size="sm" variant="light" color="gray">Published</Badge>
              ) : post.status === "paused" ? (
                <Badge size="sm" variant="light" color="gray">Paused</Badge>
              ) : (
                <Badge size="sm" variant="light" color="teal">Scheduled</Badge>
              )}
              {repeating && (
                <Badge
                  size="sm"
                  variant="light"
                  color="orange"
                  leftSection={<Repeat size={11} />}
                >
                  Repeats
                </Badge>
              )}
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2} mb={6}>
              {post.caption}
            </Text>

            <Text size="xs" c="dimmed">
              {repeating ? cadence(post) : timeLabel(post.nextRunAt)}
              {repeating && post.status === "active" && (
                <> · next {new Date(post.nextRunAt).toLocaleString()}</>
              )}
              {post.postCount > 0 && <> · {post.postCount} published</>}
            </Text>

            {/* The last outcome, when there was one. A failure carries the
                reason the server already wrote for display. */}
            {post.lastStatus === "failed" && post.lastError && (
              <Group gap={6} mt={6} wrap="nowrap">
                <TriangleAlert size={13} style={{ color: "var(--mantine-color-orange-6)", flexShrink: 0 }} />
                <Text size="xs" c="orange">{post.lastError}</Text>
              </Group>
            )}
            {post.lastStatus === "ok" && (
              <Group gap={6} mt={6} wrap="nowrap">
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
          </div>
        </Group>

        <Group gap={6} wrap="nowrap">
          <Tooltip label={sent ? "Reschedule" : "Edit"} withArrow>
            <Button variant="default" size="compact-sm" onClick={() => onEdit(post)}>
              <Pencil size={14} />
            </Button>
          </Tooltip>
          {/* Nothing to pause on a post that has already gone out. */}
          {!sent && (
            <Tooltip label={post.status === "active" ? "Pause" : "Resume"} withArrow>
              <Button variant="default" size="compact-sm" onClick={() => onToggle(post)}>
                {post.status === "active" ? <Pause size={14} /> : <Play size={14} />}
              </Button>
            </Tooltip>
          )}
          <Tooltip label="Delete" withArrow>
            <Button variant="default" size="compact-sm" onClick={() => onDelete(post)}>
              <Trash2 size={14} />
            </Button>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}

export function PostQueue({
  posts,
  onEdit,
  onToggle,
  onDelete,
}: {
  posts: ScheduledPost[];
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
}) {
  const handlers = { onEdit, onToggle, onDelete };

  // Three shelves: what happens on a given day, what happens on a cadence, and
  // what already happened. Repeating posts sit apart because they belong to no
  // single day and would otherwise reappear under whichever one is next.
  const upcoming = posts
    .filter((p) => p.mode !== "repeat" && p.status !== "sent")
    .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt));
  const repeating = posts.filter((p) => p.mode === "repeat");
  const sent = posts
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
    <Stack gap="xl">
      {days.map((day) => (
        <div key={day.label}>
          <Text size="sm" fw={700} mb="sm">{day.label}</Text>
          <Stack gap="sm">
            {day.posts.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
          </Stack>
        </div>
      ))}

      {repeating.length > 0 && (
        <div>
          <Group gap={7} mb="sm" wrap="nowrap">
            <Repeat size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text size="sm" fw={700}>Repeating</Text>
          </Group>
          <Stack gap="sm">
            {repeating.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
          </Stack>
        </div>
      )}

      {sent.length > 0 && (
        <div>
          <Text size="sm" fw={700} mb="sm" c="dimmed">Published</Text>
          <Stack gap="sm">
            {sent.map((post) => <PostRow key={post.id} post={post} {...handlers} />)}
          </Stack>
        </div>
      )}
    </Stack>
  );
}
