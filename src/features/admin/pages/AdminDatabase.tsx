import { useMemo } from "react";
import {
  Text, Stack, Group, Card, Center, Loader, RingProgress, Table,
  Box, Divider, Tooltip,
} from "@mantine/core";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useGetDbStatsQuery } from "@/app/store";
import { num } from "@/shared/lib";
import type { DbCollectionStats } from "@/shared/types";

/**
 * Admin-only: how much storage the database holds and how close it sits to the
 * plan ceiling.
 *
 * `used` is on-disk storage plus indexes — the figure the Atlas M0 free tier
 * caps at 512 MB. The table is sorted by that same weight and folds the long
 * tail of near-empty collections into one row so the ones that matter stay
 * readable.
 */

/** Collections below this share of total storage get folded into one row. */
const TAIL_THRESHOLD = 0.01;

export default function AdminDatabase() {
  const { data } = useGetDbStatsQuery();

  const rows = useMemo(() => {
    if (!data) return { shown: [] as DbCollectionStats[], tail: [] as DbCollectionStats[], tailBytes: 0 };
    const weight = (c: DbCollectionStats) => c.storageSize + c.indexSize;
    const total = data.used || 1;
    const sorted = [...data.collectionStats].sort((a, b) => weight(b) - weight(a));
    const shown: DbCollectionStats[] = [];
    const tail: DbCollectionStats[] = [];
    for (const c of sorted) {
      if (weight(c) / total >= TAIL_THRESHOLD || shown.length < 5) shown.push(c);
      else tail.push(c);
    }
    const tailBytes = tail.reduce((s, c) => s + weight(c), 0);
    return { shown, tail, tailBytes };
  }, [data]);

  if (!data) {
    return (
      <AppShell>
        <PageHeader title="Database" description="Storage the database is using." />
        <Center py={64}><Loader size="sm" /></Center>
      </AppShell>
    );
  }

  const pct = data.limit > 0 ? (data.used / data.limit) * 100 : 0;
  const tone = pct >= 90 ? "red.5" : pct >= 75 ? "yellow.5" : "emerald.5";
  const maxWeight = rows.shown.length
    ? Math.max(...rows.shown.map((c) => c.storageSize + c.indexSize))
    : 1;

  return (
    <AppShell>
      <PageHeader
        title="Database"
        description={`Storage used by “${data.name}”, and headroom against the plan limit.`}
      />

      <Stack gap="lg" style={{ maxWidth: 1000 }}>
        {/* Hero: plan usage */}
        <Card withBorder radius="lg" padding="xl">
          <Group align="center" gap="xl" wrap="nowrap">
            <RingProgress
              size={132}
              thickness={12}
              roundCaps
              sections={[{ value: Math.min(100, pct), color: tone }]}
              label={
                <Text ta="center" fw={800} fz={22} style={{ letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {pct < 1 ? pct.toFixed(1) : Math.round(pct)}%
                </Text>
              }
            />
            <Box style={{ flex: 1 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: "0.06em" }}>
                Plan usage
              </Text>
              <Group gap={6} align="baseline" mt={4}>
                <Text fw={800} fz={30} style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
                  {bytes(data.used)}
                </Text>
                <Text c="dimmed" fz="sm">of {bytes(data.limit)}</Text>
              </Group>
              <Text size="sm" c="dimmed" mt={2}>
                {bytes(data.limit - data.used)} free · Atlas M0 free-tier ceiling
              </Text>

              <Divider my="md" />

              <Group gap="xl">
                <Metric label="Documents on disk" value={bytes(data.storageSize)} />
                <Metric label="Indexes" value={bytes(data.indexSize)} />
                <Metric label="Uncompressed" value={bytes(data.dataSize)} />
                <Metric label="Documents" value={num(data.objects)} />
              </Group>
            </Box>
          </Group>
        </Card>

        {/* Per-collection */}
        <Card withBorder radius="lg" padding={0}>
          <Group justify="space-between" px="xl" py="md">
            <Text fw={700} size="sm">By collection</Text>
            <Text size="xs" c="dimmed">{num(data.collections)} collections · sorted by storage + indexes</Text>
          </Group>
          <Table verticalSpacing="sm" horizontalSpacing="xl" layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "40%" }}>Collection</Table.Th>
                <Table.Th ta="right" style={{ width: "15%" }}>Docs</Table.Th>
                <Table.Th ta="right" style={{ width: "15%" }}>Storage</Table.Th>
                <Table.Th ta="right" style={{ width: "15%" }}>Indexes</Table.Th>
                <Table.Th ta="right" style={{ width: "15%" }}>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.shown.map((c) => {
                const w = c.storageSize + c.indexSize;
                return (
                  <Table.Tr key={c.name}>
                    <Table.Td>
                      <Text size="sm" fw={550} truncate>{c.name}</Text>
                      <Box mt={5} h={4} style={{ borderRadius: 3, background: "var(--mantine-color-default-border)", overflow: "hidden" }}>
                        <Box h="100%" w={`${Math.max(2, (w / maxWeight) * 100)}%`} style={{ background: "var(--mantine-color-blue-5)", borderRadius: 3 }} />
                      </Box>
                    </Table.Td>
                    <Table.Td ta="right"><Num>{num(c.count)}</Num></Table.Td>
                    <Table.Td ta="right"><Num>{bytes(c.storageSize)}</Num></Table.Td>
                    <Table.Td ta="right"><Num>{bytes(c.indexSize)}</Num></Table.Td>
                    <Table.Td ta="right"><Num fw={650}>{bytes(w)}</Num></Table.Td>
                  </Table.Tr>
                );
              })}
              {rows.tail.length > 0 && (
                <Table.Tr>
                  <Table.Td>
                    <Tooltip
                      multiline
                      w={260}
                      label={rows.tail.map((c) => c.name).join(", ")}
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <Text size="sm" c="dimmed" style={{ cursor: "help" }}>
                        {rows.tail.length} smaller collections
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td ta="right"><Num c="dimmed">—</Num></Table.Td>
                  <Table.Td ta="right"><Num c="dimmed">—</Num></Table.Td>
                  <Table.Td ta="right"><Num c="dimmed">—</Num></Table.Td>
                  <Table.Td ta="right"><Num c="dimmed">{bytes(rows.tailBytes)}</Num></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Card>

        <Text size="xs" c="dimmed">
          Storage is what the documents take on disk after compression, which is
          why it reads below the uncompressed size. Indexes are counted
          separately; the two together are what the plan limit measures.
        </Text>
      </Stack>
    </AppShell>
  );
}

/** Bytes as a short human string — binary units, matching Atlas. */
function bytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / 1024 ** i;
  return `${v.toFixed(i === 0 ? 0 : v < 10 ? 2 : 1)} ${units[i]}`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fw={700} fz="lg" style={{ letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={1}>{label}</Text>
    </div>
  );
}

function Num({
  children,
  fw = 500,
  c,
}: {
  children: React.ReactNode;
  fw?: number;
  c?: string;
}) {
  return (
    <Text component="span" size="sm" fw={fw} c={c} style={{ fontVariantNumeric: "tabular-nums" }}>
      {children}
    </Text>
  );
}
