import {
  ActionIcon, Anchor, Badge, Box, Card, Divider, Group, Stack, Table, Text, Tooltip,
} from "@mantine/core";
import { ArrowDown, ArrowUp, ExternalLink, Minus, RefreshCw, Trash2 } from "lucide-react";
import type { SeoCompareVerdict, SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { timeAgo } from "@/shared/lib";

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
function VerdictMark({ verdict }: { verdict: SeoCompareVerdict }) {
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
    <Tooltip label="Too close to call" withArrow>
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

export function CompetitorDetail({
  comparison,
  myDomain,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  myDomain: string;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { gap, snapshot, label } = comparison;
  const theyLead = gap.scoreGap > 0;
  const losing = gap.metrics.filter((m) => m.verdict === "lose");

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
            <Text size="xs" c="dimmed" mb={2}>
              Last checked
            </Text>
            <Text size="sm" lh={1.5}>
              {comparison.lastCheckedAt ? timeAgo(comparison.lastCheckedAt) : "Not yet"}
            </Text>
          </Box>
        </Group>
      </Card>

      {gap.recommendations.length > 0 && (
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" wrap="nowrap" mb="md">
            <Text fw={650} size="sm">
              What would close the gap
            </Text>
            {/* Orbit receives these same gaps in its data digest, so it answers
                from the measured comparison rather than guessing. */}
            <AskOrbitButton
              question={`How do I close the SEO gap against ${label}? Walk me through the changes in order.`}
            />
          </Group>
          <Stack gap={10}>
            {gap.recommendations.map((rec, i) => (
              <Group key={i} gap={10} align="flex-start" wrap="nowrap">
                {/* Numbered, because the server returns these in priority order
                    and a bullet would hide that they are ranked. */}
                <Text size="xs" fw={700} c="dimmed" style={{ minWidth: 14, marginTop: 2 }}>
                  {i + 1}
                </Text>
                <Text size="sm" style={{ minWidth: 0 }}>
                  {rec}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>
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
        <Group justify="space-between" px="lg" pt="lg" pb="md" wrap="nowrap">
          <Text fw={650} size="sm">
            Every check
          </Text>
          <Text size="xs" c="dimmed">
            {losing.length === 0
              ? "You match or beat them everywhere"
              : `Behind on ${losing.length} of ${gap.metrics.length}`}
          </Text>
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
              {gap.metrics.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>
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
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.mine}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <VerdictMark verdict={m.verdict} />
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

      {comparison.lastCheckedAt === null && (
        <Text size="xs" c="dimmed">
          This page has not been fetched yet.
        </Text>
      )}
    </Stack>
  );
}
