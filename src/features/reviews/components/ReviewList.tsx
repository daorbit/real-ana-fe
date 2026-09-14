import { Avatar, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { CornerDownRight } from "lucide-react";
import { Stars } from "./RatingSummary";
import type { GoogleReviewItem } from "@/shared/types";

/**
 * The reviews themselves.
 *
 * Reviewer names and photos are rendered as Google supplied them — the photo
 * straight from Google's URL rather than mirrored into our own storage, which
 * is both what Google's terms expect and one less copy of someone's face on
 * our servers.
 */

/**
 * A review's date, in the reader's locale.
 *
 * Absolute rather than relative: an owner scanning for "did this follow the
 * refit in March" is served by a date, and "8 months ago" makes them do the
 * arithmetic.
 */
function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function ReviewList({ reviews }: { reviews: GoogleReviewItem[] }) {
  return (
    <Stack gap="md">
      {reviews.map((review) => (
        <Paper key={review.id} withBorder p="md" radius="md">
          <Group align="flex-start" gap="md" wrap="nowrap">
            <Avatar src={review.photo || undefined} radius="xl" size="md">
              {review.author.slice(0, 1).toUpperCase()}
            </Avatar>

            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Group gap="sm" wrap="wrap">
                <Text fw={600} size="sm">
                  {review.author}
                </Text>
                <Stars value={review.rating} size={13} />
                {review.createdAt && (
                  <Text size="xs" c="dimmed">
                    {formatDate(review.createdAt)}
                  </Text>
                )}
              </Group>

              {/* A star-only rating carries no text, which is normal and not
                  worth an empty paragraph or a placeholder. */}
              {review.comment && (
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {review.comment}
                </Text>
              )}

              {review.reply && (
                <Paper bg="var(--mantine-color-default-hover)" p="sm" radius="sm" mt={4}>
                  <Group gap={6} mb={4}>
                    <CornerDownRight size={13} aria-hidden />
                    <Text size="xs" fw={600} c="dimmed">
                      Response from the owner
                    </Text>
                  </Group>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {review.reply}
                  </Text>
                </Paper>
              )}
            </Stack>
          </Group>
        </Paper>
      ))}

      {/*
        Google requires that review content it supplies is attributed to it.
        Kept at the foot of the list rather than on each card: one clear notice
        is the requirement, and repeating it per review is noise.
      */}
      <Group justify="center" mt="xs">
        <Badge variant="light" color="gray" size="sm">
          Reviews powered by Google
        </Badge>
      </Group>
    </Stack>
  );
}
