import { Badge, Box, Card, Group, Progress, SimpleGrid, Table, Text } from "@mantine/core";
import { Boxes, ExternalLink } from "lucide-react";
import type { SeoDiagnostics } from "@/shared/types";

/**
 * What the page is actually made of, and what third parties cost it.
 *
 * Lighthouse reports these whatever the page scores, so they never surface as
 * suggestions — a page can pass every audit and still be carrying 400 KB of
 * third-party JavaScript worth knowing about.
 */

/** Lighthouse resource type keys, in the order worth reading them. */
const TYPE_LABEL: Record<string, string> = {
  script: "JavaScript",
  stylesheet: "CSS",
  image: "Images",
  font: "Fonts",
  document: "HTML",
  media: "Media",
  other: "Other",
  "third-party": "Third party",
};

function kb(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function ms(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(1)} s`;
  return `${Math.round(value)} ms`;
}

export function DiagnosticsPanel({ diagnostics }: { diagnostics?: SeoDiagnostics }) {
  if (!diagnostics) return null;

  const { byType, totalBytes, totalRequests, thirdParty } = diagnostics;
  const hasComposition = byType.length > 0 && totalBytes;
  const hasThirdParty = thirdParty.length > 0;

  // Older reports carry none of this; a card with three em-dashes helps nobody.
  if (!hasComposition && !hasThirdParty && diagnostics.domElements === null) return null;

  return (
    <Card withBorder radius="md" padding="lg">
      <Group gap={8} mb="md" wrap="nowrap">
        <Boxes size={15} className="sect-ic" />
        <Text fw={600} size="sm">
          Page composition
        </Text>
        {totalRequests !== null && totalBytes !== null && (
          <Badge size="xs" variant="light" color="gray">
            {totalRequests} requests · {kb(totalBytes)}
          </Badge>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, lg: hasThirdParty ? 2 : 1 }} spacing="lg">
        {hasComposition && (
          <Box>
            <Text size="xs" c="dimmed" mb="sm">
              Transfer size by resource type
            </Text>
            {byType.slice(0, 7).map((row) => {
              const share = totalBytes ? Math.round((row.bytes / totalBytes) * 100) : 0;
              return (
                <Box key={row.type} mb={10}>
                  <Group justify="space-between" mb={3} wrap="nowrap">
                    <Text size="xs">{TYPE_LABEL[row.type] ?? row.type}</Text>
                    <Text size="xs" c="dimmed">
                      {kb(row.bytes)} · {row.requests}
                    </Text>
                  </Group>
                  <Progress value={share} size={5} color="cyan" />
                </Box>
              );
            })}
          </Box>
        )}

        {hasThirdParty && (
          <Box>
            <Group justify="space-between" mb="sm" wrap="nowrap">
              <Text size="xs" c="dimmed">
                Third parties, by main-thread time
              </Text>
              <ExternalLink size={12} className="sect-ic" />
            </Group>
            <Box style={{ overflowX: "auto" }}>
              <Table verticalSpacing={6} fz="xs" miw={280}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Origin</Table.Th>
                    <Table.Th ta="right">Blocking</Table.Th>
                    <Table.Th ta="right">Size</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {thirdParty.slice(0, 6).map((t) => (
                    <Table.Tr key={t.entity}>
                      <Table.Td>
                        <Text size="xs" truncate maw={160}>
                          {t.entity}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="xs" c={t.blockingMs > 250 ? "red" : undefined}>
                          {t.blockingMs ? ms(t.blockingMs) : "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="xs" c="dimmed">
                          {t.bytes ? kb(t.bytes) : "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </SimpleGrid>

      <Group gap="lg" mt="md" wrap="wrap">
        <Stat label="DOM elements" value={diagnostics.domElements?.toLocaleString() ?? "—"} />
        <Stat label="Main thread" value={ms(diagnostics.mainThreadMs)} />
        <Stat label="Server response" value={ms(diagnostics.serverResponseMs)} />
      </Group>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={650}>
        {value}
      </Text>
    </Box>
  );
}
