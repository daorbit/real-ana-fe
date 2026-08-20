import {
  Alert, Badge, Box, Card, Group, RingProgress, Stack, Text,
} from "@mantine/core";
import { Info, Gauge, ShieldCheck } from "lucide-react";
import type { SeoPerformance, SeoSuggestion } from "@/shared/types";
import { scoreColor } from "@/features/seo/components/ScoreRing";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { EmptyState } from "@/shared/ui/EmptyState";

/**
 * Category order, worst-consequence first.
 *
 * Lighthouse hands back findings interleaved across categories, which reads as
 * one long undifferentiated list. Grouping them means someone fixing
 * performance is not stepping over contrast ratios to find the next bundle
 * issue. Anything not named here sorts to the end in whatever order it arrived.
 */
const CATEGORY_ORDER = ["performance", "accessibility", "seo", "best-practices"];

function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

/**
 * Group findings by category, preserving the server's worst-first order inside
 * each group.
 */
function groupByCategory(suggestions: SeoSuggestion[]): [string, SeoSuggestion[]][] {
  const groups = new Map<string, SeoSuggestion[]>();

  for (const s of suggestions) {
    const existing = groups.get(s.category);
    if (existing) existing.push(s);
    else groups.set(s.category, [s]);
  }

  return [...groups.entries()].sort(([a], [b]) => categoryRank(a) - categoryRank(b));
}

export function SuggestionsPanel({ performance }: { performance: SeoPerformance }) {
  // No Lighthouse data at all — an older report, or a run Google could not
  // complete. Either way the fix is the same: run it again.
  if (!performance.available) {
    return (
      <EmptyState
        compact
        icon={Gauge}
        title="No Lighthouse data"
        description="This report has no Lighthouse audit attached. Re-run it to pull fresh performance, accessibility and SEO scores."
      />
    );
  }

  if (!performance.suggestions.length) {
    return (
      <EmptyState
        compact
        icon={ShieldCheck}
        title="Clean sweep"
        description="Lighthouse found nothing to fix on this page."
      />
    );
  }

  const groups = groupByCategory(performance.suggestions);

  return (
    <Stack gap="xl">
      <Alert color="blue" variant="light" icon={<Info size={16} />} radius="md">
        Grouped by category, worst first within each. Each entry is a Lighthouse audit this
        page failed, with what to change and roughly what it saves.
      </Alert>

      {groups.map(([category, items]) => (
        <Stack key={category} gap="sm">
          {/* The group header carries the count, so the size of each problem
              area is legible before reading a single finding. */}
          <Group gap="xs" align="baseline">
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
              {category.replace("-", " ")}
            </Text>
            <Text size="xs" c="dimmed">
              {items.length} {items.length === 1 ? "finding" : "findings"}
            </Text>
          </Group>

          <Stack gap="sm">
            {items.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * One failed audit, fully expanded.
 *
 * Everything is visible at once by design. These are things someone has to go
 * and change, and a collapsed row hides the two parts that decide whether they
 * bother: what to actually do, and which files it touches.
 */
function SuggestionCard({ suggestion: s }: { suggestion: SeoSuggestion }) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <RingProgress
          size={38}
          thickness={4}
          roundCaps
          sections={[{ value: s.score, color: scoreColor(s.score) }]}
          label={
            <Text ta="center" size="xs" fw={700}>
              {s.score}
            </Text>
          }
        />

        <Stack gap="sm" style={{ minWidth: 0, flex: 1 }}>
          <Box>
            {/* No truncation here — the row no longer has to fit a fixed-height
                control, so a long audit title can simply wrap. */}
            <Text size="sm" fw={600}>
              {s.title}
            </Text>
            {s.displayValue && (
              <Badge size="xs" variant="light" color="orange" mt={5}>
                {s.displayValue}
              </Badge>
            )}
          </Box>

          <Text size="sm" lh={1.6}>
            {s.advice}
          </Text>

          {s.description && s.description !== s.advice && (
            <Text size="xs" c="dimmed" lh={1.55}>
              {s.description}
            </Text>
          )}

          {s.resources.length > 0 && (
            <Box>
              <Text size="xs" fw={650} c="dimmed" mb={5} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                Affected resources
              </Text>
              <Stack gap={3}>
                {s.resources.map((r) => (
                  <Text key={r} size="xs" c="dimmed" truncate>
                    {r}
                  </Text>
                ))}
              </Stack>
            </Box>
          )}

          {/* Lighthouse says what failed and roughly what it costs; it rarely
              says what to change in your code. That is the step people stall
              on, so the way to ask sits at the end of the finding. */}
          <Box>
            <AskOrbitButton
              question={`My Lighthouse audit flagged: "${s.title}". ${s.advice} What exactly do I change to fix this?`}
              label="How do I fix this?"
            />
          </Box>
        </Stack>
      </Group>
    </Card>
  );
}
