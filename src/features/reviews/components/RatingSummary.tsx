import { Box, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { Star } from "lucide-react";
import type { GoogleReviewLocation } from "@/shared/types";

/**
 * The headline rating, and the distribution behind it.
 *
 * The average alone hides the shape: 4.2 from a hundred fives and twenty ones
 * is a different business from 4.2 where almost everything is a four, and the
 * owner needs to see which they are. That is the whole reason the histogram
 * sits beside the number rather than on a separate tab.
 */

/** Five stars, filled to the rating. Half-stars are not worth the complexity. */
function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <Group gap={2} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          // Filled below the rating, outline above it — rounding up at the
          // halfway point, which is how Google itself renders a 4.6.
          fill={star <= Math.round(value) ? "var(--mantine-color-yellow-5)" : "none"}
          color={
            star <= Math.round(value)
              ? "var(--mantine-color-yellow-5)"
              : "var(--mantine-color-dimmed)"
          }
          aria-hidden
        />
      ))}
    </Group>
  );
}

export function RatingSummary({
  locations,
  breakdown,
}: {
  locations: GoogleReviewLocation[];
  breakdown: { stars: number; count: number }[];
}) {
  // Combined by review count, so a 500-review branch is not averaged equally
  // with a 3-review one.
  const totalReviews = locations.reduce((sum, l) => sum + l.totalReviewCount, 0);
  const weighted = locations.reduce((sum, l) => sum + l.averageRating * l.totalReviewCount, 0);
  const rating = totalReviews ? weighted / totalReviews : 0;

  // The histogram is drawn against the reviews actually held, which is not
  // `totalReviews`: Google's count includes star-only ratings its API never
  // returns. Scaling the bars by a total the rows cannot reach would leave
  // every bar short of the width its share deserves.
  const counted = breakdown.reduce((sum, row) => sum + row.count, 0);

  return (
    <Paper withBorder p="lg" radius="md">
      <Group align="flex-start" gap="xl" wrap="wrap">
        <Stack gap={4} style={{ minWidth: 120 }}>
          <Text fz={44} fw={700} lh={1}>
            {rating ? rating.toFixed(1) : "—"}
          </Text>
          <Stars value={rating} />
          <Text size="sm" c="dimmed">
            {totalReviews.toLocaleString()} {totalReviews === 1 ? "review" : "reviews"}
          </Text>
        </Stack>

        <Box style={{ flex: "1 1 240px", minWidth: 0 }}>
          <Stack gap={6}>
            {breakdown.map(({ stars, count }) => (
              <Group key={stars} gap="sm" wrap="nowrap">
                <Text size="sm" c="dimmed" style={{ width: 28, flexShrink: 0 }}>
                  {stars} ★
                </Text>
                <Progress
                  value={counted ? (count / counted) * 100 : 0}
                  color="yellow"
                  size="sm"
                  radius="xl"
                  style={{ flex: 1 }}
                  aria-label={`${count} ${stars}-star reviews`}
                />
                <Text size="sm" c="dimmed" style={{ width: 40, flexShrink: 0, textAlign: "right" }}>
                  {count}
                </Text>
              </Group>
            ))}
          </Stack>
        </Box>
      </Group>
    </Paper>
  );
}

export { Stars };
