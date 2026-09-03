import { Box, Card, Group, Progress, Stack, Text, Tooltip } from "@mantine/core";
import { Trophy } from "lucide-react";
import type { SeoCompetitivePosition } from "@/shared/types";

/**
 * Where you stand across the whole tracked field.
 *
 * The rest of the page answers "how do I compare to this one rival", which
 * stops being the question the moment someone tracks a second. A page made
 * entirely of pairwise deltas can tell you that three competitors each lead by
 * a few points without ever saying the thing that follows from it — that you
 * are last.
 *
 * Leads with the rank rather than the score because the score alone is not
 * self-evaluating: 72 is good or bad depending entirely on who else is in the
 * field, and the field is right here.
 */

/** Ordinal suffix, so the rank reads as a placing rather than a quantity. */
function ordinal(n: number): string {
  // 11th/12th/13th break the last-digit rule and have to be special-cased.
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function StandingsCard({
  position,
  myScore,
  onSelectCompetitor,
}: {
  position: SeoCompetitivePosition;
  myScore: number;
  /** Jumps the detail pane to a rival named here, so the line is actionable. */
  onSelectCompetitor: (competitorId: string) => void;
}) {
  const { rank, fieldSize, percentile, leader, gapToLeader, nextUp, closestBehind } = position;
  const leading = rank === 1;

  // Three bands rather than a continuous scale: the colour is answering "is
  // this fine", which has no meaningful gradient between "you lead" and "you
  // are mid-table".
  const tone = leading ? "teal" : percentile >= 50 ? "yellow" : "red";

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
        <Group gap="sm" wrap="nowrap">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              background: `var(--mantine-color-${tone}-light)`,
            }}
          >
            <Trophy size={17} color={`var(--mantine-color-${tone}-filled)`} />
          </Box>
          <Box>
            <Group gap={8} align="baseline">
              <Text fz={24} fw={700} lh={1.1} c={tone}>
                {ordinal(rank)}
              </Text>
              <Text size="sm" c="dimmed">
                of {fieldSize}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {leading
                ? "You lead the field you are tracking"
                : `Behind ${leader}, who leads by ${gapToLeader}`}
            </Text>
          </Box>
        </Group>

        <Box style={{ textAlign: "right" }}>
          <Text size="xs" c="dimmed" mb={2}>
            Your score
          </Text>
          <Text fz={24} fw={700} lh={1.1} style={{ fontVariantNumeric: "tabular-nums" }}>
            {myScore}
          </Text>
        </Box>
      </Group>

      <Tooltip
        label={`You beat ${percentile}% of the competitors you track. This is the tracked set only — not the whole search results page.`}
        withArrow
        multiline
        w={260}
      >
        <Progress value={percentile} color={tone} size="sm" radius="xl" mb="md" />
      </Tooltip>

      <Stack gap={6}>
        {/* The winnable fight, stated as one specific move. "You rank 3rd" is a
            fact; "you are 4 points from passing Acme" is a thing to go and do. */}
        {nextUp && (
          <Text
            size="sm"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectCompetitor(nextUp.competitorId)}
          >
            <Text span fw={700} c="orange">
              {nextUp.gap} {nextUp.gap === 1 ? "point" : "points"}
            </Text>{" "}
            from passing{" "}
            <Text span fw={600} td="underline">
              {nextUp.label}
            </Text>
            .
          </Text>
        )}
        {closestBehind && (
          <Text
            size="sm"
            c="dimmed"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectCompetitor(closestBehind.competitorId)}
          >
            <Text span fw={600}>
              {closestBehind.label}
            </Text>{" "}
            is {closestBehind.gap} behind you.
          </Text>
        )}
        {!nextUp && !closestBehind && (
          <Text size="sm" c="dimmed">
            Every competitor you track scores level with you.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
