import {
  Text, Stack, Group, Card, Center, Loader, ThemeIcon, SimpleGrid,
  Progress, Table, Alert, Badge,
} from "@mantine/core";
import { Database, HardDrive, ListTree, Boxes, Info } from "lucide-react";
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
 * caps at 512 MB. The per-collection table is sorted by that same weight so
 * the ones worth pruning sit at the top.
 */
export default function AdminDatabase() {
  const { data, isLoading } = useGetDbStatsQuery();

  if (isLoading || !data) {
    return (
      <AppShell>
        <PageHeader title="Database" description="Storage the database is using." />
        <Center py={64}><Loader size="sm" /></Center>
      </AppShell>
    );
  }

  const pct = data.limit > 0 ? (data.used / data.limit) * 100 : 0;
  const tone = pct >= 90 ? "red" : pct >= 75 ? "yellow" : "emerald";

  return (
    <AppShell>
      <PageHeader
        title="Database"
        description={`Storage used by "${data.name}", and headroom against the plan limit.`}
      />

      <Stack gap="lg">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          <Stat icon={HardDrive} label="Used (storage + indexes)" value={bytes(data.used)} />
          <Stat icon={Database} label="Documents on disk" value={bytes(data.storageSize)} />
          <Stat icon={ListTree} label="Indexes" value={bytes(data.indexSize)} />
          <Stat icon={Boxes} label="Documents" value={num(data.objects)} />
        </SimpleGrid>

        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" align="baseline" mb="xs">
            <Text fw={650} size="sm">Plan usage</Text>
            <Text size="sm" c="dimmed">
              {bytes(data.used)} of {bytes(data.limit)} · {pct.toFixed(1)}%
            </Text>
          </Group>
          <Progress value={Math.min(100, pct)} color={tone} size="lg" radius="md" />
          <Text size="xs" c="dimmed" mt="xs">
            {bytes(Math.max(0, data.limit - data.used))} free. The limit is the
            Atlas M0 free-tier ceiling of {bytes(data.limit)} (storage plus
            indexes). Uncompressed the documents are {bytes(data.dataSize)}.
          </Text>
        </Card>

        <Card withBorder radius="md" padding={0}>
          <Group justify="space-between" px="lg" py="md">
            <Text fw={650} size="sm">By collection</Text>
            <Badge variant="light" color="gray">{num(data.collections)} collections</Badge>
          </Group>
          <Table.ScrollContainer minWidth={560}>
            <Table striped highlightOnHover verticalSpacing="xs" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Collection</Table.Th>
                  <Table.Th ta="right">Documents</Table.Th>
                  <Table.Th ta="right">Data</Table.Th>
                  <Table.Th ta="right">Storage</Table.Th>
                  <Table.Th ta="right">Indexes</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.collectionStats.map((c: DbCollectionStats) => (
                  <Table.Tr key={c.name}>
                    <Table.Td><Text size="sm" ff="var(--font-mono, monospace)">{c.name}</Text></Table.Td>
                    <Table.Td ta="right">{num(c.count)}</Table.Td>
                    <Table.Td ta="right">{bytes(c.dataSize)}</Table.Td>
                    <Table.Td ta="right">{bytes(c.storageSize)}</Table.Td>
                    <Table.Td ta="right">{bytes(c.indexSize)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
          <Text size="sm">
            Storage is what the documents take on disk after WiredTiger
            compression, which is why it reads well below the uncompressed data
            size. Indexes are counted separately and both together are what the
            plan limit measures.
          </Text>
        </Alert>
      </Stack>
    </AppShell>
  );
}

/** Bytes as a short human string — decimal units, matching what Atlas shows. */
function bytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / 1024 ** i;
  return `${v.toFixed(i === 0 ? 0 : v < 10 ? 2 : 1)} ${units[i]}`;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <ThemeIcon size={28} radius="md" variant="light" color="gray" mb="sm">
        <Icon size={14} />
      </ThemeIcon>
      <Text
        fz={26}
        fw={700}
        lh={1.1}
        style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>{label}</Text>
    </Card>
  );
}
