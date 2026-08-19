import { ActionIcon, Avatar, Badge, Box, Group, Menu, Text, Tooltip } from "@mantine/core";
import {
  ExternalLink, MoreHorizontal, Pause, Pencil, Play, Repeat, Send, Trash2,
} from "lucide-react";
import { STAGE_COLOR, STAGE_LABEL, stageOf } from "../postStatus";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { ScheduledPost } from "@/shared/types";

/** "1:24 PM" — just the clock, since the day is the heading above. */
function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * One scheduled post, as a slot on a timeline.
 *
 * The time sits in its own gutter *outside* the card rather than as a column
 * inside it, which is what makes the page read as a schedule running down the
 * day instead of a table of rows that happen to carry times. The card beside it
 * is the post as it will appear: who it goes out as, what it says, and the
 * actions for it along the foot.
 */
export function PostRow({
  post,
  author,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  publishingId,
  recentlyMovedId,
}: {
  post: ScheduledPost;
  /** The connected account these publish as. */
  author: string;
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
    <Group className="post-slot" align="flex-start" wrap="nowrap" gap={0}>
      {/* The gutter. Repeating posts have no single clock time, so they say
          their cadence here instead. */}
      <Box className="post-slot__time">
        <Text size="sm" fw={500}>
          {post.mode === "repeat" ? "Repeats" : clock(post.nextRunAt)}
        </Text>
        {post.mode === "repeat" && (
          <Group gap={4} wrap="nowrap" mt={2}>
            <Repeat size={11} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text size="xs" c="dimmed">{post.frequency}</Text>
          </Group>
        )}
      </Box>

      <Box
        className="post-slot__card"
        style={{ borderColor: moved ? "var(--accent)" : undefined }}
      >
        {/* Who it goes out as. The same line the post itself will carry in the
            feed, so the card previews the thing rather than describing it. */}
        <Group gap={8} wrap="nowrap" align="center" p="md" pb={8}>
          <Box style={{ position: "relative", flexShrink: 0 }}>
            <Avatar size={28} radius="xl" color="blue">
              {author.trim().charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Box className="post-slot__network" aria-hidden>
              <LinkedInMark size={8} color="#fff" />
            </Box>
          </Box>
          <Text size="sm" fw={600} truncate style={{ flex: 1, minWidth: 0 }}>
            {author || "LinkedIn"}
          </Text>
          {moved && <Badge size="xs" variant="filled">Moved</Badge>}
          <Badge size="sm" variant="light" color={STAGE_COLOR[stage]}>
            {STAGE_LABEL[stage]}
          </Badge>
        </Group>

        <Box px="md" pb={post.imageUrl ? 8 : 12}>
          <Text size="sm" fw={600} mb={2} truncate>{post.name}</Text>
          <Text size="sm" c="dimmed" lineClamp={2}>{post.caption}</Text>
        </Box>

        {post.imageUrl && (
          <Box px="md" pb={12}>
            <img className="post-slot__image" src={post.imageUrl} alt="" />
          </Box>
        )}

        {/* The foot: what happened to it, and what can be done about it. */}
        <Group className="post-slot__foot" justify="space-between" wrap="nowrap" gap="sm">
          <Text size="xs" c={stage === "failed" ? "orange" : "dimmed"} truncate>
            {stage === "failed" && post.lastError
              ? post.lastError
              : sent && post.lastRunAt
                ? `Published ${new Date(post.lastRunAt).toLocaleString()}`
                : post.postCount > 0
                  ? `${post.postCount} published so far`
                  : draft
                    ? "Saved as a draft — publishes nothing until you schedule it"
                    : "Waiting to publish"}
          </Text>

          <Group gap={6} wrap="nowrap">
            <Tooltip label="Post now" withArrow>
              <ActionIcon
                variant="default"
                size="md"
                loading={publishing}
                onClick={() => onPublish(post)}
                aria-label="Post now"
              >
                <Send size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={sent ? "Reschedule" : "Edit"} withArrow>
              <ActionIcon variant="default" size="md" onClick={() => onEdit(post)} aria-label="Edit">
                <Pencil size={14} />
              </ActionIcon>
            </Tooltip>

            {/* The rest behind a menu: three icons is a row of actions, six is
                a puzzle, and only these two are reached often. */}
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="default" size="md" aria-label="More actions">
                  <MoreHorizontal size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {post.lastPostUrl && (
                  <Menu.Item
                    component="a"
                    href={post.lastPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftSection={<ExternalLink size={14} />}
                  >
                    View on LinkedIn
                  </Menu.Item>
                )}
                {/* Nothing to hold back on a post that has already gone out. */}
                {!sent && (
                  <Menu.Item
                    leftSection={draft ? <Play size={14} /> : <Pause size={14} />}
                    onClick={() => onToggle(post)}
                  >
                    {draft ? "Schedule it" : "Move to drafts"}
                  </Menu.Item>
                )}
                <Menu.Item
                  color="red"
                  leftSection={<Trash2 size={14} />}
                  onClick={() => onDelete(post)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
    </Group>
  );
}
