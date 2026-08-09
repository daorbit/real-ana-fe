import { Box, Card, Group, ScrollArea, Table, Text, Tooltip } from "@mantine/core";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { SeoCompareVerdict, SeoCompetitorComparison } from "@/shared/types";

/**
 * Every check, across every competitor, in one grid.
 *
 * The gap cards answer "what should I do"; this answers "show me the numbers".
 * Both are needed — a reader who distrusts the recommendation needs to see
 * what it was derived from, or the advice reads as an oracle.
 *
 * Your own value appears once per row rather than as a column, because it is
 * the constant every competitor is measured against.
 */

/**
 * The mark shown beside a competitor's value.
 *
 * The server's verdict is written from *your* point of view — "win" means you
 * are ahead. This mark sits in the competitor's column beside their number, so
 * it has to be inverted to describe them: your win is their loss. Rendering the
 * verdict directly put a green tick next to a competitor's 16-character title,
 * which read as "their title is fine" when it means the opposite.
 */
function VerdictMark({ verdict }: { verdict: SeoCompareVerdict }) {
  // "lose" means they beat you, so their column gets the warning mark.
  if (verdict === "lose") {
    return (
      <Tooltip label="They beat you on this" withArrow>
        <ArrowUp size={14} color="var(--mantine-color-red-5)" />
      </Tooltip>
    );
  }
  if (verdict === "win") {
    return (
      <Tooltip label="You beat them on this" withArrow>
        <ArrowDown size={14} color="var(--mantine-color-teal-5)" />
      </Tooltip>
    );
  }
  return (
    <Tooltip label="Too close to call" withArrow>
      <Minus size={14} style={{ opacity: 0.4 }} />
    </Tooltip>
  );
}

export function MetricMatrix({
  competitors,
  myLabel,
}: {
  competitors: SeoCompetitorComparison[];
  myLabel: string;
}) {
  // Every comparison carries the same metric list in the same order, so the
  // first one defines the rows.
  const rows = competitors[0]?.gap.metrics ?? [];
  if (!rows.length) return null;

  return (
    <Card withBorder radius="md" padding={0}>
      <ScrollArea>
        <Table verticalSpacing="sm" fz="sm" miw={640} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={170}>Check</Table.Th>
              {/* Fixed widths across the value columns: sized to their headers,
                  a long domain stretched one column and squeezed the rest. */}
              <Table.Th w={130}>
                <Tooltip label={myLabel} withArrow>
                  <Text size="xs" fw={700} c="emerald" truncate>
                    You
                  </Text>
                </Tooltip>
              </Table.Th>
              {competitors.map((c) => (
                <Table.Th key={c.competitorId} w={130}>
                  <Tooltip label={c.url} withArrow>
                    <Text size="xs" fw={700} truncate>
                      {c.label}
                    </Text>
                  </Tooltip>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, i) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  {row.note ? (
                    <Tooltip label={row.note} withArrow multiline w={280}>
                      <Text size="sm" fw={500} style={{ width: "fit-content", cursor: "help" }}>
                        {row.label}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text size="sm" fw={500}>
                      {row.label}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.mine}
                  </Text>
                </Table.Td>
                {competitors.map((c) => {
                  const metric = c.gap.metrics[i];
                  return (
                    <Table.Td key={c.competitorId}>
                      <Group gap={6} wrap="nowrap">
                        <VerdictMark verdict={metric?.verdict ?? "tie"} />
                        <Text
                          size="sm"
                          c={metric?.verdict === "lose" ? undefined : "dimmed"}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {metric?.theirs ?? "—"}
                        </Text>
                      </Group>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Box px="md" py="sm">
        <Group gap="lg" wrap="wrap">
          {/* Worded from the competitor's column, which is where the marks
              live — "they are ahead here" beside their number. */}
          <Group gap={5} wrap="nowrap">
            <ArrowUp size={13} color="var(--mantine-color-red-5)" />
            <Text size="xs" c="dimmed">They beat you here</Text>
          </Group>
          <Group gap={5} wrap="nowrap">
            <ArrowDown size={13} color="var(--mantine-color-teal-5)" />
            <Text size="xs" c="dimmed">You beat them here</Text>
          </Group>
          <Group gap={5} wrap="nowrap">
            <Minus size={13} style={{ opacity: 0.4 }} />
            <Text size="xs" c="dimmed">Too close to call</Text>
          </Group>
        </Group>
      </Box>
    </Card>
  );
}
