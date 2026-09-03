import { useState } from "react";
import {
  ActionIcon, Alert, Anchor, Badge, Box, Card, Divider, Group, SegmentedControl,
  Stack, Table, Text, Tooltip,
} from "@mantine/core";
import { ArrowDown, ArrowUp, ExternalLink, Info, Minus, RefreshCw, Trash2 } from "lucide-react";
import type { SeoCompareVerdict, SeoCompetitorComparison, SeoMetricComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { FreshnessBadge, freshnessOf, STALE_AFTER_DAYS } from "./FreshnessBadge";
import { CompetitorBriefCard } from "./CompetitorBriefCard";

/**
 * One competitor, in full.
 *
 * Everything about a single rival lives here — the standing, what would close
 * the gap, the specific things they have that you do not, and every check with
 * both values. The page previously showed all of that for every competitor at
 * once across four stacked blocks, which meant the same comparison was restated
 * four times and none of it led.
 */

/**
 * The mark beside a competitor's value.
 *
 * The server's verdict is written from your point of view — "win" means you are
 * ahead — so it is inverted here to describe the column it sits in. Arrows
 * rather than ticks: the question is directional, not correct/incorrect.
 */
function VerdictMark({
  verdict,
  tieReason,
}: {
  verdict: SeoCompareVerdict;
  /**
   * Why two visibly different numbers tied. Without it a row reading "68 vs 70
   * — too close to call" looks like the comparison failed to do its arithmetic,
   * which costs more trust than the tolerance saves.
   */
  tieReason?: string;
}) {
  if (verdict === "lose") {
    return (
      <Tooltip label="They beat you here" withArrow>
        <ArrowUp size={13} color="var(--mantine-color-red-5)" />
      </Tooltip>
    );
  }
  if (verdict === "win") {
    return (
      <Tooltip label="You beat them here" withArrow>
        <ArrowDown size={13} color="var(--mantine-color-teal-5)" />
      </Tooltip>
    );
  }
  return (
    <Tooltip
      label={tieReason ?? "Both pages measure the same here."}
      withArrow
      multiline={Boolean(tieReason)}
      w={tieReason ? 250 : undefined}
    >
      <Minus size={13} style={{ opacity: 0.35 }} />
    </Tooltip>
  );
}

/** A labelled row of gap chips, rendered only when there is something in it. */
function GapRow({ title, items, hint }: { title: string; items: string[]; hint: string }) {
  if (!items.length) return null;
  return (
    <Box>
      <Tooltip label={hint} withArrow multiline w={280} position="top-start">
        <Text size="xs" fw={650} c="dimmed" mb={6} style={{ width: "fit-content", cursor: "help" }}>
          {title}
        </Text>
      </Tooltip>
      {/* `wrap` explicitly, and a light variant rather than the filled default:
          eight filled orange chips read as eight warnings, where these are
          prompts to look at something.

          `tt="none"` because Badge uppercases its content — fine for a status
          word, wrong for a section heading, which is prose someone wrote and is
          about to go and look for on the page. */}
      <Group gap={6} wrap="wrap">
        {items.map((item) => (
          <Badge
            key={item}
            size="sm"
            variant="light"
            color="orange"
            tt="none"
            style={{
              // Badge truncates to a single line by default, which turned a
              // long heading into an unreadable stub. Letting it wrap costs a
              // taller chip and keeps the text legible.
              height: "auto",
              whiteSpace: "normal",
              lineHeight: 1.4,
              padding: "3px 8px",
              maxWidth: "100%",
              textAlign: "left",
            }}
          >
            {item}
          </Badge>
        ))}
      </Group>
    </Box>
  );
}

/** How the check table is ordered. */
type SortMode = "impact" | "listed";

/**
 * Order rows by what is actually costing points.
 *
 * The declared order is a reasonable reading order but a poor diagnostic one:
 * it puts the overall score first and buries a 900-word content deficit below
 * a tied Open Graph row. Sorting by impact leads with the fix worth making.
 *
 * The score row is pinned to the top in both modes. It is the summary the rest
 * of the table explains, and it carries no impact of its own by design, so
 * sorting would otherwise drop the headline number to the bottom.
 */
function orderMetrics(metrics: SeoMetricComparison[], mode: SortMode): SeoMetricComparison[] {
  if (mode === "listed") return metrics;
  const score = metrics.filter((m) => m.id === "score");
  const rest = [...metrics.filter((m) => m.id !== "score")].sort((a, b) => b.impact - a.impact);
  return [...score, ...rest];
}

export function CompetitorDetail({
  comparison,
  myDomain,
  myAuditedAt,
  workspaceId,
  siteId,
  briefAvailable,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  myDomain: string;
  /**
   * When your own baseline was measured. Needed to say whether the two sides of
   * the comparison were taken far enough apart to distrust the result.
   */
  myAuditedAt: string | null;
  /** Identifiers the briefing endpoint is scoped by. */
  workspaceId: string;
  siteId: string;
  /** False where the deployment has no model credentials — the panel is hidden. */
  briefAvailable: boolean;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { gap, snapshot, label } = comparison;
  const theyLead = gap.scoreGap > 0;
  const losing = gap.metrics.filter((m) => m.verdict === "lose");

  const [sortMode, setSortMode] = useState<SortMode>("impact");
  const rows = orderMetrics(gap.metrics, sortMode);

  const stale = freshnessOf(comparison.lastCheckedAt) === "stale";

  // Two measurements taken weeks apart are not really a comparison, however
  // precise each one is on its own. Said plainly rather than left for the
  // reader to work out from two timestamps in different corners of the page.
  const skewDays =
    myAuditedAt && comparison.lastCheckedAt
      ? Math.abs(
          new Date(myAuditedAt).getTime() - new Date(comparison.lastCheckedAt).getTime()
        ) /
        (24 * 60 * 60 * 1000)
      : 0;
  const skewed = skewDays > STALE_AFTER_DAYS;

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                background: "var(--mantine-color-default-hover)",
              }}
            >
              <SiteFavicon domain={comparison.url} size={20} />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Text fw={700} fz={18} truncate>
                {label}
              </Text>
              <Anchor
                href={comparison.url}
                target="_blank"
                rel="noreferrer"
                size="xs"
                c="dimmed"
              >
                <Group gap={4} wrap="nowrap">
                  <Text size="xs" truncate maw={320}>
                    {comparison.url}
                  </Text>
                  <ExternalLink size={11} style={{ flexShrink: 0 }} />
                </Group>
              </Anchor>
            </Box>
          </Group>

          {canEdit && (
            <Group gap={4} wrap="nowrap">
              <Tooltip label="Re-fetch this page" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={onRefresh}
                  loading={refreshing}
                  aria-label="Re-fetch this page"
                >
                  <RefreshCw size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Stop tracking" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={onDelete}
                  aria-label="Stop tracking"
                >
                  <Trash2 size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>

        <Divider my="md" />

        <Group gap="xl" wrap="wrap">
          <Box>
            <Text size="xs" c="dimmed" mb={2}>
              Their score
            </Text>
            <Text fz={28} fw={700} lh={1.1} style={{ fontVariantNumeric: "tabular-nums" }}>
              {snapshot.score}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" mb={2}>
              Yours
            </Text>
            <Text
              fz={28}
              fw={700}
              lh={1.1}
              c="emerald"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {snapshot.score - gap.scoreGap}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" mb={2}>
              Standing
            </Text>
            <Text
              fz={18}
              fw={650}
              lh={1.5}
              c={theyLead ? "red" : gap.scoreGap === 0 ? "dimmed" : "teal"}
            >
              {theyLead
                ? `They lead by ${gap.scoreGap}`
                : gap.scoreGap === 0
                ? "Level"
                : `You lead by ${Math.abs(gap.scoreGap)}`}
            </Text>
          </Box>
          <Box style={{ marginLeft: "auto" }}>
            <Text size="xs" c="dimmed" mb={4}>
              Last checked
            </Text>
            <FreshnessBadge checkedAt={comparison.lastCheckedAt} />
          </Box>
        </Group>

        {/* Placed under the numbers rather than above them: the caveat qualifies
            the figures, so it should not be read before there is anything to
            qualify. */}
        {(stale || skewed) && (
          <Alert
            icon={<Info size={15} />}
            color="orange"
            variant="light"
            radius="md"
            mt="md"
            p="sm"
          >
            <Text size="xs">
              {skewed
                ? `Your audit and this snapshot were taken ${Math.round(skewDays)} days apart. Refresh both for a comparison of what is live now.`
                : "This snapshot is over a week old. Their page may have changed since it was taken."}
            </Text>
          </Alert>
        )}
      </Card>

      {/* The measured recommendations and Orbit's reading of them are one card,
          not two: they answer the same question, and shown separately the page
          said "add internal links" twice in different words directly above
          itself. Where the briefing is unavailable this still renders, carrying
          the measured list alone. */}
      {gap.recommendations.length > 0 && (
        <CompetitorBriefCard
          workspaceId={workspaceId}
          siteId={siteId}
          competitorId={comparison.competitorId}
          label={label}
          recommendations={gap.recommendations}
          briefAvailable={briefAvailable && Boolean(comparison.lastCheckedAt)}
        />
      )}

      {(gap.contentGaps.length > 0 ||
        gap.missingSchemaTypes.length > 0 ||
        gap.missingKeywords.length > 0) && (
        <Card withBorder radius="md" padding="lg">
          <Text fw={650} size="sm" mb="md">
            What they have that you do not
          </Text>
          <Stack gap="md">
            <GapRow
              title="Sections they cover"
              items={gap.contentGaps}
              hint="Headings on their page with no counterpart on yours. Each is a question a visitor asked that your page does not answer."
            />
            <GapRow
              title="Schema they declare"
              items={gap.missingSchemaTypes}
              hint="Structured data types they mark up. This earns rich results and makes a page quotable by AI answer engines."
            />
            <GapRow
              title="Prominent terms"
              items={gap.missingKeywords}
              hint="Words used often on their page and not at all on yours. A prompt for what to write about — not a checklist to stuff in."
            />
          </Stack>
        </Card>
      )}

      <Card withBorder radius="md" padding={0}>
        <Group justify="space-between" px="lg" pt="lg" pb="md" wrap="wrap" gap="sm">
          <Box>
            <Text fw={650} size="sm">
              Every check
            </Text>
            <Text size="xs" c="dimmed">
              {losing.length === 0
                ? "You match or beat them everywhere"
                : `Behind on ${losing.length} of ${gap.metrics.length}`}
            </Text>
          </Box>
          {/* Defaults to impact, so the table opens on the thing worth fixing.
              The declared order stays available because it groups related
              checks together, which is easier to read once you know the page
              rather than triage it. */}
          <SegmentedControl
            size="xs"
            radius="md"
            value={sortMode}
            onChange={(v) => setSortMode(v as SortMode)}
            data={[
              { label: "Biggest gaps", value: "impact" },
              { label: "Grouped", value: "listed" },
            ]}
          />
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" fz="sm" miw={420}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={200}>Check</Table.Th>
                <Table.Th w={130}>
                  <Tooltip label={myDomain} withArrow>
                    <Text size="xs" fw={700} c="emerald">
                      You
                    </Text>
                  </Tooltip>
                </Table.Th>
                <Table.Th>
                  <Text size="xs" fw={700} truncate maw={160}>
                    {label}
                  </Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      {m.note ? (
                        <Tooltip label={m.note} withArrow multiline w={280} position="top-start">
                          <Text size="sm" fw={500} style={{ width: "fit-content", cursor: "help" }}>
                            {m.label}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text size="sm" fw={500}>
                          {m.label}
                        </Text>
                      )}
                      {/* Marks the rows carrying most of the deficit, so the
                          ranking stays legible after switching to the grouped
                          order. Threshold rather than every losing row: a badge
                          on eight of eleven rows marks nothing. */}
                      {m.impact >= 0.05 && (
                        <Tooltip
                          label="One of the largest contributors to the score gap."
                          withArrow
                        >
                          <Badge size="xs" variant="light" color="red" style={{ cursor: "help" }}>
                            High impact
                          </Badge>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.mine}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <VerdictMark verdict={m.verdict} tieReason={m.tieReason} />
                      <Text
                        size="sm"
                        c={m.verdict === "lose" ? undefined : "dimmed"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {m.theirs}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>

    </Stack>
  );
}
