import { useMemo } from "react";
import { ActionIcon, Alert, Anchor, Badge, Group, Skeleton, Stack, Table, Text } from "@mantine/core";
import { AlertTriangle, ArrowLeft, ExternalLink, FileSearch, Link as LinkIcon, Search, TimerReset } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { AppShell } from "@/app/AppShell";
import { useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { METRICS, pagePath } from "../searchMetrics";
import { renderQuery } from "../searchConsoleTabs";
import { SearchPerformanceChart } from "../components/SearchPerformanceChart";
import classes from "../components/searchConsole.module.css";

export default function SearchConsolePageDetail() {
  const navigate = useNavigate();
  const { pageKey } = useParams();
  const [search] = useSearchParams();
  const pageUrl = search.get("url") ?? "";
  const workspaceId = search.get("workspaceId") ?? "";
  const siteId = search.get("siteId") ?? "";
  const days = Number(search.get("days") ?? "28") || 28;
  const type = (search.get("type") as SearchType | null) ?? "web";

  const detailQuery = useGetSearchDrilldownQuery(
    {
      workspaceId,
      siteId,
      dimension: "page",
      value: pageUrl,
      days,
      type,
    },
    { skip: !workspaceId || !siteId || !pageUrl },
  );

  const indexStatus = useMemo(() => {
    if (!detailQuery.data) return "Waiting for Google data";
    const data = detailQuery.data as { indexStatus?: string; lastCrawled?: string; fetchedAt?: string };
    if (data.indexStatus) return data.indexStatus;
    if (data.lastCrawled) return "Indexed in Google search";
    if (detailQuery.data.totals.clicks > 0 || detailQuery.data.totals.impressions > 0 || detailQuery.data.related.length > 0)
      return "Indexed in Google search";
    return "No recent index signal";
  }, [detailQuery.data]);

  const lastCrawled = useMemo(() => {
    if (!detailQuery.data) return null;
    const data = detailQuery.data as { lastCrawled?: string; fetchedAt?: string };
    return data.lastCrawled ?? data.fetchedAt ?? null;
  }, [detailQuery.data]);

  if (!workspaceId || !siteId || !pageUrl) {
    return (
      <AppShell>
        <Alert color="red" variant="light" icon={<FileSearch size={16} />}>
          {errMessage(new Error("Missing page detail parameters."), "This page detail link is incomplete.")}
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <ActionIcon variant="default" size="lg" aria-label="Back to Search visibility" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </ActionIcon>
          <Badge variant="light" color="teal" radius="sm">
            Route key: {pageKey ?? "detail"}
          </Badge>
        </Group>

        <div className={classes.card}>
          <div className={classes.cardHead}>
            <div>
              <Text fw={650} size="sm" c="dimmed" tt="uppercase">
                Page detail
              </Text>
              <Text fw={700} size="lg" mt={4}>
                {pagePath(pageUrl)}
              </Text>
            </div>
            <Group gap="xs">
              <Anchor href={pageUrl} target="_blank" rel="noreferrer" size="sm">
                Open page <ExternalLink size={12} />
              </Anchor>
            </Group>
          </div>

          {detailQuery.isLoading ? (
            <Stack gap="md">
              <Skeleton height={72} radius="md" />
              <Skeleton height={180} radius="md" />
              <Skeleton height={220} radius="md" />
            </Stack>
          ) : detailQuery.error || !detailQuery.data ? (
            <Alert color="red" variant="light" icon={<Search size={16} />}>
              {errMessage(detailQuery.error, "Could not load this page detail from Google.")}
            </Alert>
          ) : (
            <Stack gap="lg">
              <Group gap="md" wrap="wrap">
                <Badge leftSection={<Search size={12} />} variant="light" color="blue" radius="sm">
                  {detailQuery.data.totals.clicks.toLocaleString()} clicks
                </Badge>
                <Badge leftSection={<LinkIcon size={12} />} variant="light" color="cyan" radius="sm">
                  {detailQuery.data.totals.impressions.toLocaleString()} impressions
                </Badge>
                <Badge leftSection={<TimerReset size={12} />} variant="light" color="grape" radius="sm">
                  {lastCrawled ? `Last crawled ${dayjs(lastCrawled).format("MMM D, YYYY")}` : `Fetched ${dayjs(detailQuery.data.fetchedAt).format("MMM D, YYYY")}`}
                </Badge>
                <Badge variant="light" color={indexStatus.includes("Indexed") ? "teal" : indexStatus.includes("Not indexed") ? "red" : "gray"} radius="sm">
                  {indexStatus}
                </Badge>
              </Group>

              {detailQuery.data.issues && detailQuery.data.issues.length > 0 && (
                <Alert color="yellow" variant="light" icon={<AlertTriangle size={16} />}>
                  <Text fw={600} size="sm" mb={4}>Indexing issue notes</Text>
                  <Stack gap={4}>
                    {detailQuery.data.issues.slice(0, 3).map((issue, idx) => (
                      <Text key={`${issue.message}-${idx}`} size="sm">{issue.message}</Text>
                    ))}
                  </Stack>
                </Alert>
              )}

              <div className={classes.tiles}>
                {METRICS.map((m) => {
                  const value = detailQuery.data.totals[m.key];
                  return (
                    <div key={m.key} className={classes.tile}>
                      <span className={classes.tileLabel}>{m.label}</span>
                      <span className={classes.tileValue}>{m.format(value)}</span>
                      {detailQuery.data.previous && m.key !== "position" && (
                        <span className={classes.change} data-good={value >= (detailQuery.data.previous[m.key] ?? 0) || undefined}>
                          {m.key === "ctr" && detailQuery.data.previous[m.key] !== null
                            ? `${((value - (detailQuery.data.previous[m.key] ?? 0)) * 100).toFixed(1)} pts`
                            : `${Math.round(Math.abs(value - (detailQuery.data.previous[m.key] ?? 0)))} vs prev`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {detailQuery.data.daily.length > 1 ? (
                <SearchPerformanceChart daily={detailQuery.data.daily} metric={METRICS[0]} />
              ) : (
                <Text size="sm" c="dimmed">
                  Not enough daily signals to chart this page yet.
                </Text>
              )}

              <div>
                <Text fw={650} size="sm" mb="sm">
                  Keywords driving this page
                </Text>
                {detailQuery.data.related.length === 0 ? (
                  <Text size="sm" c="dimmed">No related queries are recorded for this page yet.</Text>
                ) : (
                  <Table verticalSpacing={8} fz="xs" className={classes.table}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Keyword</Table.Th>
                        {METRICS.map((m) => (
                          <Table.Th key={m.key} className={classes.numCell}>
                            {m.key === "position" ? "Pos." : m.label}
                          </Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {detailQuery.data.related.slice(0, 12).map((row, i) => (
                        <Table.Tr key={`${row.key}-${i}`}>
                          <Table.Td className={classes.labelCell}>{renderQuery(row)}</Table.Td>
                          {METRICS.map((m) => (
                            <Table.Td key={`${row.key}-${m.key}`} className={classes.numCell}>
                              {m.format(row[m.key])}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </div>
            </Stack>
          )}
        </div>
      </Stack>
    </AppShell>
  );
}
