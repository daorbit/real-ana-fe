import { Avatar, Badge, Box, Button, Group, Text, Tooltip } from "@mantine/core";
import {
  Activity, BarChart3, CalendarPlus, ExternalLink, Eye, MessageSquare, ThumbsUp, TrendingUp,
} from "lucide-react";
import { InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { SentPost } from "@/shared/types";

/** "7:09 PM" — the clock alone, since the day is the heading above. */
function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * A count as it should read, or a dash where there is no number.
 *
 * The dash is the important half. A post published four minutes ago has no
 * impressions yet, and a post nobody is permitted to measure never will —
 * printing "0" for either states that nobody saw it, which is a measurement
 * this app has not made. Large numbers are abbreviated because the column is
 * narrow and "12.4K" is read faster than "12,431".
 */
function figure(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

/** LinkedIn reports engagement as a fraction; the feed shows it as a percentage. */
function rate(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(value < 0.01 ? 2 : 0)}%`;
}

/**
 * One statistic, under its own label.
 *
 * The label is always shown, even when the figure is a dash: a column of
 * unexplained dashes tells the reader nothing, while "Impressions —" says
 * plainly that this is a number we do not have.
 */
function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** Why the figure is missing, where it is. */
  hint?: string;
}) {
  const body = (
    <Box className="sent-post__stat">
      <Group gap={5} wrap="nowrap" align="center" justify="center">
        {icon}
        <Text size="xs" c="dimmed">{label}</Text>
      </Group>
      <Text size="sm" fw={600} ta="center" mt={2} c={value === "—" ? "dimmed" : undefined}>
        {value}
      </Text>
    </Box>
  );

  return hint ? <Tooltip label={hint} withArrow>{body}</Tooltip> : body;
}

/**
 * One published post, with what it earned.
 *
 * Deliberately the same shape as `PostRow` on the queue — time in a gutter
 * outside the card, the post previewed inside it — so the Sent tab reads as the
 * same timeline continued rather than as a different screen. The difference is
 * the foot: a scheduled post shows the actions available to it, and a published
 * one shows what happened after it went out.
 */
export function SentPostRow({
  post,
  author,
  authorPicture,
  statsAvailable,
  onScheduleAgain,
}: {
  post: SentPost;
  author: string;
  authorPicture?: string;
  /**
   * Send this one's content again, as a new post.
   *
   * Offered on failures, where it is the only way forward: a run cannot be
   * retried in place — it records a moment that has passed, and the schedule
   * that produced it may have moved on or been deleted since.
   */
  onScheduleAgain?: (post: SentPost) => void;
  /**
   * Whether engagement can be measured at all on this deployment.
   *
   * False today — the LinkedIn app has no product granting post analytics — and
   * the row explains that once, in a tooltip on the figures, rather than
   * pretending the numbers are merely late.
   *
   * A LinkedIn answer only. Instagram insights are a separate API and a
   * permission this app does not request, so an Instagram row shows no figures
   * regardless of what this says.
   */
  statsAvailable: boolean;
}) {
  const failed = post.status === "failed";
  const { stats } = post;
  // Which network published it. History is mixed once both are connected, and
  // a LinkedIn mark on an Instagram post misstates where it went.
  const isInstagram = post.provider === "instagram";
  const networkName = isInstagram ? "Instagram" : "LinkedIn";

  /**
   * Why a figure is missing, said once and reused across all five.
   *
   * Only ever reached where analytics exist at all — a deployment without them
   * shows no figures to explain — so this covers the one remaining case: the
   * post is too new for LinkedIn to have reported anything.
   */
  const hint = stats.unavailable === "pending"
    ? "LinkedIn has not reported figures for this post yet. They usually appear within a few hours."
    : undefined;

  return (
    <Group className="post-slot" align="flex-start" wrap="nowrap" gap={0}>
      <Box className="post-slot__time">
        <Text fw={500}>{clock(post.publishedAt)}</Text>
        <Group gap={4} wrap="nowrap" mt={2} justify="flex-end">
          <Text size="xs" c="dimmed">
            {post.source === "share" ? "Shared" : post.source === "manual" ? "Manual" : "Scheduled"}
          </Text>
        </Group>
      </Box>

      <Box className="post-slot__card">
        <Group gap={8} wrap="nowrap" align="center" p="md" pb={8}>
          <Box style={{ position: "relative", flexShrink: 0 }}>
            <Avatar size={28} radius="xl" color="blue" src={authorPicture || undefined}>
              {author.trim().charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Box
              className={`post-slot__network${isInstagram ? " post-slot__network--instagram" : ""}`}
              aria-hidden
            >
              {isInstagram
                ? <InstagramMark size={8} color="#fff" />
                : <LinkedInMark size={8} color="#fff" />}
            </Box>
          </Box>
          <Text size="sm" fw={600} truncate style={{ flex: 1, minWidth: 0 }}>
            {author || networkName}
          </Text>
          {failed && <Badge size="sm" variant="light" color="orange">Failed</Badge>}
        </Group>

        <Box px="md" pb={post.imageUrl ? 8 : 12}>
          <Text size="sm" c={failed ? "dimmed" : undefined} lineClamp={3}>
            {post.caption}
          </Text>
        </Box>

        {post.imageUrl && (
          <Box px="md" pb={12}>
            <img className="post-slot__image" src={post.imageUrl} alt="" />
          </Box>
        )}

        {/* A post that never went out has nothing to measure, so the failure
            takes the place of the figures rather than sitting above a row of
            dashes that would imply it published to silence.

            Where analytics are not available at all, the figures are dropped
            rather than shown as five dashes: a row of blanks under labels like
            "Impressions" reads as a number that failed to load, and no amount
            of explaining beside it undoes that first impression. Nothing is
            shown because there is nothing to show. */}
        {failed ? (
          <Box className="post-slot__foot">
            <Text size="xs" c="orange">
              {post.error || "This post could not be published."}
            </Text>
          </Box>
        ) : statsAvailable && !isInstagram ? (
          <Box className="sent-post__stats">
            <Stat
              icon={<ThumbsUp size={13} />}
              label="Reactions"
              value={figure(stats.likes)}
              hint={hint}
            />
            <Stat
              icon={<MessageSquare size={13} />}
              label="Comments"
              value={figure(stats.comments)}
              hint={hint}
            />
            <Stat
              icon={<Activity size={13} />}
              label="Eng. Rate"
              value={rate(stats.engagement)}
              hint={hint}
            />
            <Stat
              icon={<Eye size={13} />}
              label="Impressions"
              value={figure(stats.impressions)}
              hint={hint}
            />
            <Stat
              icon={<TrendingUp size={13} />}
              label="Reach"
              value={figure(stats.uniqueImpressions)}
              hint={hint}
            />
          </Box>
        ) : null}

        <Group className="post-slot__foot" justify="space-between" wrap="nowrap" gap="sm">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            {isInstagram ? <InstagramMark size={12} /> : <LinkedInMark size={12} />}
            <Text size="xs" c="dimmed" truncate>
              {failed ? "Not published" : `Published via ${networkName}`}
            </Text>
          </Group>

          <Group gap={6} wrap="nowrap">
            {/* On a failure this is the only action there is, so it is named
                rather than tucked behind an icon. */}
            {failed && onScheduleAgain && (
              <Button
                variant="default"
                size="compact-sm"
                leftSection={<CalendarPlus size={13} />}
                onClick={() => onScheduleAgain(post)}
              >
                Schedule again
              </Button>
            )}

            {post.postUrl && (
              <Button
                component="a"
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="default"
                size="compact-sm"
                leftSection={<ExternalLink size={13} />}
              >
                Go to post
              </Button>
            )}
          </Group>
        </Group>
      </Box>
    </Group>
  );
}

/**
 * The stats icon used by the tab's own header.
 *
 * Exported so the page can label the tab without importing the icon set twice.
 */
export const SentTabIcon = BarChart3;
