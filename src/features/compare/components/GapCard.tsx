import { Badge, Box, Card, Divider, Group, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { ArrowDown, ArrowUp, Check, Minus, Target } from "lucide-react";
import type { SeoCompetitorComparison } from "@/shared/types";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";

/**
 * One competitor, summarised as the answer rather than the data.
 *
 * The old comparison put every number for every competitor in one wide table
 * and left the reader to work out which columns mattered. This leads with the
 * verdict — are they ahead, by how much, and what would close it — because
 * that is the question someone opens this page holding.
 */

/** The headline: who is ahead, stated in words rather than a signed number. */
function Standing({ scoreGap }: { scoreGap: number }) {
  if (scoreGap === 0) {
    return (
      <Group gap={6} wrap="nowrap">
        <Minus size={14} style={{ opacity: 0.6 }} />
        <Text size="sm" fw={600} c="dimmed">
          Level
        </Text>
      </Group>
    );
  }

  const theyLead = scoreGap > 0;
  return (
    <Group gap={6} wrap="nowrap">
      {theyLead ? (
        <ArrowUp size={14} color="var(--mantine-color-red-5)" />
      ) : (
        <ArrowDown size={14} color="var(--mantine-color-teal-5)" />
      )}
      <Text size="sm" fw={600} c={theyLead ? "red" : "teal"}>
        {theyLead ? "They lead" : "You lead"} by {Math.abs(scoreGap)}
      </Text>
    </Group>
  );
}

/** A labelled list of gaps, rendered only when there is something in it. */
function GapList({
  title,
  items,
  hint,
}: {
  title: string;
  items: string[];
  hint: string;
}) {
  if (!items.length) return null;
  return (
    <Box>
      <Tooltip label={hint} withArrow multiline w={260}>
        <Text size="xs" fw={650} c="dimmed" mb={6} style={{ width: "fit-content" }}>
          {title}
        </Text>
      </Tooltip>
      <Group gap={6}>
        {items.map((item) => (
          <Badge key={item} size="sm" color="orange">
            {item}
          </Badge>
        ))}
      </Group>
    </Box>
  );
}

export function GapCard({
  comparison,
  isToughest,
}: {
  comparison: SeoCompetitorComparison;
  /** Whoever leads by the most, flagged so the page has an obvious entry point. */
  isToughest: boolean;
}) {
  const { gap, label, snapshot } = comparison;
  const losing = gap.metrics.filter((m) => m.verdict === "lose");
  const winning = gap.metrics.filter((m) => m.verdict === "win");

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" wrap="nowrap" mb="md">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={34} radius="md" variant="light" color={isToughest ? "orange" : "gray"}>
            <Target size={17} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Group gap={6} wrap="nowrap">
              <Text fw={650} truncate>
                {label}
              </Text>
              {isToughest && (
                <Badge size="xs" color="orange">
                  Furthest ahead
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" truncate>
              {comparison.url}
            </Text>
          </Box>
        </Group>
        <Stack gap={2} align="flex-end">
          <Text fz={22} fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
            {snapshot.score}
          </Text>
          <Standing scoreGap={gap.scoreGap} />
        </Stack>
      </Group>

      <Divider mb="md" />

      <Stack gap="md">
        {gap.recommendations.length > 0 && (
          <Box>
            <Group justify="space-between" wrap="nowrap" mb={6}>
              <Text size="xs" fw={650} c="dimmed">
                What would close the gap
              </Text>
              {/* Orbit already receives these same gaps in its data digest, so
                  it answers from the measured comparison rather than guessing.
                  Naming the competitor is what lets it pick the right one. */}
              <AskOrbitButton
                question={`How do I close the SEO gap against ${label}? Walk me through the changes in order.`}
                label="Ask Orbit"
              />
            </Group>
            <Stack gap={8}>
              {gap.recommendations.map((rec, i) => (
                <Group key={i} gap={8} align="flex-start" wrap="nowrap">
                  {/* Numbered rather than bulleted: the server returns these in
                      priority order, and a bullet hides that they are ranked. */}
                  <Text size="xs" fw={700} c="dimmed" style={{ minWidth: 14, marginTop: 2 }}>
                    {i + 1}
                  </Text>
                  <Text size="sm" style={{ minWidth: 0 }}>
                    {rec}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>
        )}

        <GapList
          title="Sections they cover that you do not"
          items={gap.contentGaps}
          hint="Headings on their page with no counterpart on yours — each is a question a visitor asked that your page does not answer."
        />
        <GapList
          title="Schema they declare and you do not"
          items={gap.missingSchemaTypes}
          hint="Structured data types they mark up. This is what earns rich results and makes a page quotable by AI answer engines."
        />
        <GapList
          title="Prominent terms absent from your page"
          items={gap.missingKeywords}
          hint="Words used often on their page and not at all on yours. Useful as a prompt, not a checklist — do not stuff them in."
        />

        <Group gap="lg" wrap="wrap">
          <Group gap={6} wrap="nowrap">
            <Check size={13} color="var(--mantine-color-teal-5)" />
            <Text size="xs" c="dimmed">
              You win {winning.length} of {gap.metrics.length} checks
            </Text>
          </Group>
          {losing.length > 0 && (
            <Text size="xs" c="dimmed">
              Behind on: {losing.map((m) => m.label.toLowerCase()).join(", ")}
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
