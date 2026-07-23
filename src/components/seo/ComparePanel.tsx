import { useState } from "react";
import {
  ActionIcon, Alert, Badge, Box, Button, Card, Center, Group, Loader, ScrollArea,
  Stack, Table, Text, TextInput, ThemeIcon, Tooltip,
} from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, Plus, RefreshCw, Swords, Trash2, XCircle, Info, Minus,
} from "lucide-react";
import type { SeoCompetitor, SeoCompareSnapshot, SeoReportData } from "../../types";
import { scoreColor } from "./ScoreRing";
import { timeAgo } from "../../utils";

/**
 * Your page beside your competitors'.
 *
 * Both sides are scored on on-page signals only — no Lighthouse. A competitor
 * audit deliberately skips PageSpeed (it costs quota that belongs to the
 * customer's own sites), so scoring your side with Lighthouse included would
 * compare two different things and flatter whichever had more inputs.
 */
export function ComparePanel({
  data,
  siteName,
  competitors,
  loading,
  adding,
  onAdd,
  onRefresh,
  onDelete,
}: {
  data: SeoReportData;
  siteName: string;
  competitors: SeoCompetitor[];
  loading: boolean;
  adding: boolean;
  onAdd: (url: string) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [url, setUrl] = useState("");

  // Your own page, reduced to the same shape a competitor snapshot has, so the
  // table can treat every column identically.
  const mine = toSnapshot(data);

  const columns = [
    { id: "self", label: siteName, snapshot: mine, isSelf: true, error: "" },
    ...competitors.map((c) => ({
      id: c._id,
      label: c.label || c.url,
      snapshot: c.snapshot,
      isSelf: false,
      error: c.lastError,
    })),
  ];

  const submit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setUrl("");
  };

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" padding="lg">
        <Group gap="sm" align="flex-end" wrap="wrap">
          <Box style={{ flex: "1 1 320px", minWidth: 240 }}>
            <Text component="label" htmlFor="competitor-url" size="sm" fw={500} display="block" mb={4}>
              Competitor URL
            </Text>
            <TextInput
              id="competitor-url"
              placeholder="https://competitor.com/page"
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && !adding && submit()}
              radius="md"
              disabled={competitors.length >= 3}
            />
          </Box>
          <Button
            color="emerald"
            radius="md"
            leftSection={<Plus size={15} />}
            loading={adding}
            onClick={submit}
            disabled={competitors.length >= 3}
          >
            Compare
          </Button>
        </Group>
        <Text size="xs" c="dimmed" mt="sm">
          Up to 3 competitors per site. Only publicly reachable pages can be fetched.
        </Text>
      </Card>

      {competitors.length === 0 && !loading && (
        <Card withBorder radius="md" padding="xl">
          <Center>
            <Stack align="center" gap="xs" maw={420}>
              <ThemeIcon size={48} radius="xl" variant="light" color="emerald">
                <Swords size={24} />
              </ThemeIcon>
              <Text fw={650}>Nothing to compare yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Add a competitor&apos;s page to see how your title, description, content
                depth and structured data stack up against theirs.
              </Text>
            </Stack>
          </Center>
        </Card>
      )}

      {loading && (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      )}

      {competitors.length > 0 && (
        <>
          <Alert color="gray" variant="light" radius="md" icon={<Info size={15} />}>
            Scored on on-page signals only — titles, headings, content, schema. Lighthouse
            is not run against competitors, so these numbers are not the same as the
            Lighthouse-blended score on the Overview tab.
          </Alert>

          <Card withBorder radius="md" padding={0}>
            <ScrollArea>
              <Table verticalSpacing="sm" fz="sm" miw={640}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={180}>Metric</Table.Th>
                    {columns.map((c) => (
                      <Table.Th key={c.id}>
                        <Group gap={6} wrap="nowrap" justify="space-between">
                          <Text size="xs" fw={700} truncate maw={140}>
                            {c.label}
                            {c.isSelf && (
                              <Text span c="emerald" size="xs">
                                {" "}
                                (you)
                              </Text>
                            )}
                          </Text>
                          {!c.isSelf && (
                            <Group gap={2} wrap="nowrap">
                              <Tooltip label="Re-fetch" withArrow>
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="gray"
                                  onClick={() => onRefresh(c.id)}
                                >
                                  <RefreshCw size={12} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Remove" withArrow>
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => onDelete(c.id)}
                                >
                                  <Trash2 size={12} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          )}
                        </Group>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        On-page score
                      </Text>
                    </Table.Td>
                    {columns.map((c) => (
                      <Table.Td key={c.id}>
                        {c.snapshot ? (
                          <Badge size="lg" variant="light" color={scoreColor(c.snapshot.score)}>
                            {c.snapshot.score}
                          </Badge>
                        ) : (
                          <Tooltip label={c.error || "Not fetched"} withArrow>
                            <Badge size="sm" variant="light" color="gray">
                              —
                            </Badge>
                          </Tooltip>
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>

                  {ROWS.map((row) => (
                    <Table.Tr key={row.label}>
                      <Table.Td>
                        <Tooltip label={row.hint} withArrow multiline w={240}>
                          <Text size="sm" style={{ cursor: "help" }}>
                            {row.label}
                          </Text>
                        </Tooltip>
                      </Table.Td>
                      {columns.map((c) => (
                        <Table.Td key={c.id}>
                          {c.snapshot ? (
                            row.render(c.snapshot)
                          ) : (
                            <Text size="xs" c="dimmed">
                              —
                            </Text>
                          )}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}

                  <Table.Tr>
                    <Table.Td>
                      <Text size="sm">Last checked</Text>
                    </Table.Td>
                    {columns.map((c) => (
                      <Table.Td key={c.id}>
                        <Text size="xs" c="dimmed">
                          {c.isSelf
                            ? "This report"
                            : c.snapshot
                            ? timeAgo(c.snapshot.fetchedAt)
                            : "—"}
                        </Text>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>

          {competitors.some((c) => c.lastError) && (
            <Alert color="yellow" variant="light" radius="md" icon={<AlertTriangle size={16} />}>
              Some competitors could not be fetched. Their last known values are shown where
              available.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}

/**
 * The same on-page scoring the server applies to a competitor snapshot.
 *
 * Duplicated here rather than reusing the report's own `score`, because that
 * one blends in Lighthouse and a competitor's never can. Both columns must be
 * scored the same way or the comparison is meaningless — so this mirrors
 * `scoreSnapshot` in the backend's compare.ts, and the two must stay in step.
 */
function scoreSnapshot(s: SeoCompareSnapshot): number {
  let score = 100;

  if (!s.title) score -= 15;
  else if (s.titleLength < 30 || s.titleLength > 60) score -= 5;

  if (!s.description) score -= 15;
  else if (s.descriptionLength < 70 || s.descriptionLength > 160) score -= 5;

  if (s.h1Count === 0) score -= 12;
  else if (s.h1Count > 1) score -= 4;

  if (!s.canonical) score -= 5;
  if (!s.hasHttps) score -= 15;
  if (!s.hasOpenGraph) score -= 5;
  if (!s.hasTwitterCards) score -= 2;

  if (!s.hasStructuredData) score -= 8;
  else if (s.schemaErrors > 0) score -= 4;

  if (s.wordCount < 300) score -= 10;
  else if (s.wordCount < 150) score -= 15;

  if (s.imageCount > 0 && s.imagesMissingAlt / s.imageCount > 0.5) score -= 5;
  if (s.internalLinks < 3) score -= 3;
  if (s.statusCode >= 400) score -= 40;
  if (s.responseTimeMs > 1500) score -= 5;

  return Math.max(0, Math.min(100, score));
}

/** Reduce a full audit to the fields a competitor snapshot carries. */
function toSnapshot(data: SeoReportData): SeoCompareSnapshot {
  const partial: SeoCompareSnapshot = {
    url: data.url,
    finalUrl: data.finalUrl,
    fetchedAt: new Date().toISOString(),
    statusCode: data.technical.statusCode,
    responseTimeMs: data.technical.responseTimeMs,
    pageBytes: Number(data.technical.contentLength) || 0,

    title: data.meta.title,
    titleLength: data.meta.title.length,
    description: data.meta.description,
    descriptionLength: data.meta.description.length,
    canonical: data.meta.canonical,

    h1Count: data.content.h1Count,
    h2Count: data.content.h2Count,
    wordCount: data.content.wordCount,
    imageCount: data.content.imgCount,
    imagesMissingAlt: data.technical.missingAltImages,
    internalLinks: data.content.internalLinks,
    externalLinks: data.content.externalLinks,

    hasHttps: data.technical.hasHttps,
    hasOpenGraph: data.technical.hasOpenGraph,
    hasTwitterCards: data.technical.hasTwitterCards,
    hasStructuredData: data.content.hasSchema,
    schemaTypes: data.content.schemaTypes,
    schemaErrors: data.schema?.errorCount ?? 0,

    score: 0, // filled in below
  };

  return { ...partial, score: scoreSnapshot(partial) };
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 size={15} color="var(--mantine-color-teal-5)" />
  ) : (
    <XCircle size={15} color="var(--mantine-color-red-5)" />
  );
}

/** A number with a band colour, so a column scans without reading every digit. */
function Num({
  value,
  good,
  suffix = "",
}: {
  value: number;
  /** Returns true when this value is in good shape. */
  good?: (v: number) => boolean;
  suffix?: string;
}) {
  const color = good ? (good(value) ? "teal" : "yellow") : undefined;
  return (
    <Text size="sm" fw={500} c={color}>
      {value.toLocaleString()}
      {suffix}
    </Text>
  );
}

const ROWS: {
  label: string;
  hint: string;
  render: (s: SeoCompareSnapshot) => React.ReactNode;
}[] = [
  {
    label: "Title length",
    hint: "30-60 characters shows in full in search results.",
    render: (s) => <Num value={s.titleLength} good={(v) => v >= 30 && v <= 60} suffix=" ch" />,
  },
  {
    label: "Description length",
    hint: "120-160 characters is the band search results display.",
    render: (s) => (
      <Num value={s.descriptionLength} good={(v) => v >= 70 && v <= 160} suffix=" ch" />
    ),
  },
  {
    label: "Word count",
    hint: "Depth of the page copy. 300+ is a reasonable floor to rank.",
    render: (s) => <Num value={s.wordCount} good={(v) => v >= 300} />,
  },
  {
    label: "H1 / H2",
    hint: "Exactly one H1, with H2s breaking the page into sections.",
    render: (s) => (
      <Text size="sm" fw={500} c={s.h1Count === 1 ? "teal" : "yellow"}>
        {s.h1Count} / {s.h2Count}
      </Text>
    ),
  },
  {
    label: "Internal links",
    hint: "Links within the same site. They spread authority between pages.",
    render: (s) => <Num value={s.internalLinks} good={(v) => v >= 3} />,
  },
  {
    label: "Structured data",
    hint: "JSON-LD schema, which is what produces rich results.",
    render: (s) =>
      s.hasStructuredData ? (
        <Group gap={4} wrap="nowrap">
          <CheckCircle2 size={15} color="var(--mantine-color-teal-5)" />
          <Text size="xs" c="dimmed">
            {s.schemaTypes.length} type{s.schemaTypes.length === 1 ? "" : "s"}
          </Text>
        </Group>
      ) : (
        <Minus size={15} style={{ opacity: 0.4 }} />
      ),
  },
  {
    label: "Open Graph",
    hint: "Controls how a shared link renders on social platforms.",
    render: (s) => <YesNo value={s.hasOpenGraph} />,
  },
  {
    label: "Canonical",
    hint: "Consolidates duplicate URLs onto one preferred address.",
    render: (s) => <YesNo value={Boolean(s.canonical)} />,
  },
  {
    label: "Page weight",
    hint: "HTML transfer size. Lighter pages render sooner.",
    render: (s) => (
      <Text size="sm" fw={500} c={s.pageBytes < 150_000 ? "teal" : "yellow"}>
        {s.pageBytes ? `${Math.round(s.pageBytes / 1024)} KB` : "—"}
      </Text>
    ),
  },
  {
    label: "Response time",
    hint: "Time to first byte. Under 600 ms is a reasonable target.",
    render: (s) => (
      <Text size="sm" fw={500} c={s.responseTimeMs < 600 ? "teal" : "yellow"}>
        {s.responseTimeMs} ms
      </Text>
    ),
  },
];
