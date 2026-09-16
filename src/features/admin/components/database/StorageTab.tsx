import { useMemo } from "react";
import { Box, Card, Divider, Group, RingProgress, SimpleGrid, Stack, Table, Text, Tooltip } from "@mantine/core";
import { num } from "@/shared/lib";
import type { DbStats } from "@/shared/types";
import { bytes, prettyName, splitCollections } from "./utils";
import { Metric, Num } from "./shared";
import { CloudinaryCard } from "./CloudinaryCard";

export function StorageTab({ data }: { data: DbStats }) {
  const rows = useMemo(() => splitCollections(data.collectionStats, data.used), [data]);

  const pct = data.limit > 0 ? (data.used / data.limit) * 100 : 0;
  const tone = pct >= 90 ? "red.5" : pct >= 75 ? "yellow.5" : "emerald.5";
  const maxWeight = rows.shown.length
    ? Math.max(...rows.shown.map((c) => c.storageSize + c.indexSize))
    : 1;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder radius="lg" padding="xl">
          <Group align="center" gap="lg" wrap="nowrap" h="100%">
            <RingProgress
              size={128}
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
              <Text size="sm" c="dimmed" mt={4}>
                {bytes(data.limit - data.used)} free
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Atlas M0 free-tier ceiling
              </Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder radius="lg" padding="xl">
          <SimpleGrid cols={2} spacing="lg" verticalSpacing="lg">
            <Metric label="Documents on disk" value={bytes(data.storageSize)} hint="after compression" />
            <Metric label="Indexes" value={bytes(data.indexSize)} />
            <Metric label="Uncompressed" value={bytes(data.dataSize)} hint="raw document size" />
            <Metric label="Documents" value={num(data.objects)} hint={`${num(data.collections)} collections`} />
          </SimpleGrid>
          {rows.tail.length > 0 && (
            <>
              <Divider my="lg" />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">{rows.tail.length} smaller collections</Text>
                <Text size="sm" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>{bytes(rows.tailBytes)}</Text>
              </Group>
            </>
          )}
        </Card>
      </SimpleGrid>

      {data.cloudinary && <CloudinaryCard usage={data.cloudinary} />}

      <Card withBorder radius="lg" padding={0}>
        <Group justify="space-between" px="xl" py="md">
          <Text fw={700} size="sm">By collection</Text>
          <Text size="xs" c="dimmed">sorted by storage + indexes</Text>
        </Group>
        <Table.ScrollContainer minWidth={640}>
          <Table verticalSpacing="sm" horizontalSpacing="xl" layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "44%" }}>Collection</Table.Th>
                <Table.Th ta="right">Docs</Table.Th>
                <Table.Th ta="right">Storage</Table.Th>
                <Table.Th ta="right">Indexes</Table.Th>
                <Table.Th ta="right">Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.shown.map((c) => {
                const w = c.storageSize + c.indexSize;
                return (
                  <Table.Tr key={c.name}>
                    <Table.Td>
                      <Tooltip label={c.name} openDelay={400} events={{ hover: true, focus: true, touch: false }}>
                        <Text size="sm" fw={550} truncate style={{ width: "fit-content" }}>{prettyName(c.name)}</Text>
                      </Tooltip>
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
                      label={rows.tail.map((c) => prettyName(c.name)).join(", ")}
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
        </Table.ScrollContainer>
      </Card>

      <Text size="xs" c="dimmed">
        Storage is what the documents take on disk after compression, which is
        why it reads below the uncompressed size. Indexes are counted
        separately; the two together are what the plan limit measures.
      </Text>
    </Stack>
  );
}
