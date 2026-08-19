import { ActionIcon, Badge, Box, Group, Text, Tooltip } from "@mantine/core";
import {
  ExternalLink, ImageOff, Pause, Pencil, Play, Repeat, Send, Trash2,
} from "lucide-react";
import { DELIVERY_WINDOW_MINUTES } from "./draft";
import { STAGE_COLOR, STAGE_LABEL, stageOf } from "../postStatus";
import { whenLabel } from "../postTime";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { ScheduledPost } from "@/shared/types";

/**
 * One scheduled post, as a row.
 *
 * A row rather than a card: this list is scanned down a column — "what is going
 * out, when, and did the last one work" — and a grid of cards answers none of
 * those without the eye jumping sideways. Everything sits on one baseline so a
 * reader can run down the times, or down the statuses, without re-finding them
 * on each item.
 */
export function PostRow({
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
  const stage = stageOf(post);
  const sent = post.status === "sent";
  const draft = post.status === "paused";
  const moved = recentlyMovedId === post.id;

  return (
    <Group
      className="post-row"
      wrap="nowrap"
      gap="md"
      align="center"
      style={{ borderColor: moved ? "var(--accent)" : undefined }}
    >
      {/* Small and square: at this size the image is an identifier, not a
          preview, so it only has to be recognisable beside its own text. */}
      <Box className="post-row__thumb">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" />
        ) : (
          <ImageOff size={16} strokeWidth={1.5} style={{ color: "var(--mantine-color-dimmed)" }} />
        )}
        {/* Which network this goes to. One mark today; a second sits beside it
            here rather than needing a new place to live. */}
        <Box className="post-row__network" aria-hidden>
          <LinkedInMark size={9} color="#fff" />
        </Box>
      </Box>

      <Box style={{ minWidth: 0, flex: 1 }}>
        <Group gap={8} wrap="nowrap" align="center">
          <Text fw={600} size="sm" truncate>{post.name}</Text>
          {moved && <Badge size="xs" variant="filled">Moved</Badge>}
        </Group>
        <Text size="xs" c="dimmed" truncate>{post.caption}</Text>
      </Box>

      {/* Time and status are the two columns someone scans, so they keep their
          own fixed widths rather than being pushed around by caption length.
          Both stay on a single line: a row that grows because it happens to
          carry an error or a publish count breaks the even rhythm that makes
          the column scannable in the first place. */}
      <Box className="post-row__when">
        <Tooltip
          label={`Publishes within ${DELIVERY_WINDOW_MINUTES} minutes of this time`}
          withArrow
          disabled={sent}
        >
          <Text size="xs" truncate style={{ cursor: sent ? "default" : "help" }}>
            {whenLabel(post)}
            {post.postCount > 0 && (post.mode === "repeat" || post.postCount > 1) && (
              <Text component="span" size="xs" c="dimmed"> · {post.postCount} sent</Text>
            )}
          </Text>
        </Tooltip>
      </Box>

      {/* The failure reason rides on the badge's tooltip rather than a second
          line of its own — the text the server wrote is often longer than this
          column, so it was truncated to uselessness anyway. */}
      <Group className="post-row__status" gap={6} wrap="nowrap" justify="flex-end">
        {post.mode === "repeat" && (
          <Tooltip label="Repeats on a cadence" withArrow>
            <Repeat size={13} style={{ color: "var(--mantine-color-dimmed)" }} />
          </Tooltip>
        )}
        <Tooltip
          label={post.lastError}
          withArrow
          multiline
          w={260}
          disabled={stage !== "failed" || !post.lastError}
        >
          <Badge size="sm" variant="light" color={STAGE_COLOR[stage]}>
            {STAGE_LABEL[stage]}
          </Badge>
        </Tooltip>
      </Group>

      <Group gap={4} wrap="nowrap">
        {post.lastPostUrl && (
          <Tooltip label="View on LinkedIn" withArrow>
            <ActionIcon
              component="a"
              href={post.lastPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              aria-label="View on LinkedIn"
            >
              <ExternalLink size={15} />
            </ActionIcon>
          </Tooltip>
        )}
        {/* An extra send, not a reschedule: the cadence is untouched, so a
            weekly post sent now still goes out on its usual day. */}
        <Tooltip label="Post now" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            loading={publishing}
            onClick={() => onPublish(post)}
            aria-label="Post now"
          >
            <Send size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={sent ? "Reschedule" : "Edit"} withArrow>
          <ActionIcon variant="subtle" color="gray" onClick={() => onEdit(post)} aria-label="Edit">
            <Pencil size={15} />
          </ActionIcon>
        </Tooltip>
        {/* Nothing to hold back on a post that has already gone out. */}
        {!sent && (
          <Tooltip label={draft ? "Schedule it" : "Move to drafts"} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => onToggle(post)}
              aria-label={draft ? "Schedule it" : "Move to drafts"}
            >
              {draft ? <Play size={15} /> : <Pause size={15} />}
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Delete" withArrow>
          <ActionIcon variant="subtle" color="gray" onClick={() => onDelete(post)} aria-label="Delete">
            <Trash2 size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
