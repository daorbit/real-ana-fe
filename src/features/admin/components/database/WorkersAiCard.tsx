import { Box, Card, Group, Stack, Table, Text, Tooltip } from "@mantine/core";
import { num } from "@/shared/lib";
import type { WorkersAiUsage } from "@/shared/types";
import { bytes, shortModelName, ERROR_CODE_LABELS } from "./utils";
import { Meter, Num } from "./shared";

export function WorkersAiCard({ accounts }: { accounts: WorkersAiUsage[] }) {
  return (
    <Card withBorder radius="lg" padding="xl">
      <Group justify="space-between" align="baseline" mb="lg">
        <Text fw={700} size="sm">Cloudflare Workers AI</Text>
        <Text size="xs" c="dimmed">used by Orbit chat &amp; the post planner</Text>
      </Group>

      <Stack gap="xl">
        {accounts.map((u) => {
          const pct = u.dailyLimit ? (u.neuronsToday / u.dailyLimit) * 100 : null;
          return (
            <Box
              key={u.label}
              p="lg"
              style={{
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-md)",
              }}
            >
              <Group justify="space-between" align="baseline" mb="md">
                <Text size="sm" fw={650}>{u.label}</Text>
                {!u.unavailable && (
                  <Text size="xs" c="dimmed">{num(u.neuronsToday)} of {num(u.dailyLimit)} neurons today</Text>
                )}
              </Group>

              {u.unavailable ? (
                <Text size="sm" c="dimmed">
                  Usage unavailable — {u.unavailable}. The API token needs the
                  “Account Analytics: Read” permission for the neuron count to show here.
                </Text>
              ) : (
                <>
                  <Meter label="Neurons today" used={num(u.neuronsToday)} limit={num(u.dailyLimit)} pct={pct} />

                  {u.models.length > 0 && (
                    <Table.ScrollContainer minWidth={720} mt="lg">
                      <Table verticalSpacing="sm" horizontalSpacing="lg" fz="xs" layout="fixed">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: "22%" }}>Model</Table.Th>
                            <Table.Th ta="right" style={{ width: "11%" }}>Requests</Table.Th>
                            <Table.Th ta="right" style={{ width: "11%" }}>Failed</Table.Th>
                            <Table.Th ta="right" style={{ width: "17%" }}>Tokens in/out</Table.Th>
                            <Table.Th ta="right" style={{ width: "17%" }}>Bytes in/out</Table.Th>
                            <Table.Th ta="right" style={{ width: "11%" }}>Avg time</Table.Th>
                            <Table.Th ta="right" style={{ width: "11%" }}>Neurons</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {u.models.map((m) => (
                            <Table.Tr key={m.modelId}>
                              <Table.Td>
                                <Tooltip label={m.modelId} openDelay={300} events={{ hover: true, focus: true, touch: false }}>
                                  <Text size="xs" fw={550} truncate style={{ width: "fit-content" }}>
                                    {shortModelName(m.modelId)}
                                  </Text>
                                </Tooltip>
                              </Table.Td>
                              <Table.Td ta="right"><Num>{num(m.requests)}</Num></Table.Td>
                              <Table.Td ta="right">
                                {m.failed ? (
                                  <Tooltip
                                    label={m.errorsByCode
                                      .map((e) => `${e.count}× ${ERROR_CODE_LABELS[e.code] ?? `code ${e.code}`}`)
                                      .join(", ")}
                                    openDelay={200}
                                    events={{ hover: true, focus: true, touch: false }}
                                  >
                                    <Num c="red" fw={600}>
                                      <span style={{ cursor: "help", borderBottom: "1px dotted currentColor" }}>{num(m.failed)}</span>
                                    </Num>
                                  </Tooltip>
                                ) : (
                                  <Num c="dimmed">0</Num>
                                )}
                              </Table.Td>
                              <Table.Td ta="right"><Num>{num(m.inputTokens)} / {num(m.outputTokens)}</Num></Table.Td>
                              <Table.Td ta="right"><Num>{bytes(m.bytesIn)} / {bytes(m.bytesOut)}</Num></Table.Td>
                              <Table.Td ta="right"><Num>{Math.round(m.avgLatencyMs)}ms</Num></Table.Td>
                              <Table.Td ta="right"><Num fw={650}>{m.neurons.toFixed(1)}</Num></Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Table.ScrollContainer>
                  )}
                </>
              )}
            </Box>
          );
        })}

        <Text size="xs" c="dimmed">
          One neuron is Cloudflare’s unit of inference cost; every model call
          spends some. Free tier allows 10,000 a day per account and resets at
          00:00&nbsp;UTC.
        </Text>
      </Stack>
    </Card>
  );
}
