import { useEffect, useMemo, useState } from "react";
import {
  Alert, Anchor, Badge, Box, Button, Card, Center, Group, Loader, Select, Stack,
  Table, Text, TextInput, ThemeIcon, Tooltip, ActionIcon, ScrollArea, Skeleton,
} from "@mantine/core";
import {
  Search, RefreshCw, Globe, History, Trash2, AlertTriangle, Sparkles, Info,
  ListChecks, Tags, FileText, Wrench, Lightbulb, ExternalLink,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import { useWorkspace } from "../workspace";
import {
  useGetSitesQuery, useAnalyzeSeoMutation, useGetSeoReportsQuery,
  useGetLatestSeoReportQuery, useGetSeoReportQuery, useDeleteSeoReportMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { timeAgo, dateTime } from "../utils";
import { scoreColor } from "../components/seo/ScoreRing";
import {
  ScorePanel, IssueList, MetaPanel, ContentPanel, TechnicalPanel, SuggestionsPanel,
} from "../components/seo/SeoPanels";
import type { SeoReport, SeoReportSummary } from "../types";

const TABS = [
  { value: "overview", label: "Overview", icon: ListChecks },
  { value: "meta", label: "Meta tags", icon: Tags },
  { value: "content", label: "Content", icon: FileText },
  { value: "technical", label: "Technical", icon: Wrench },
  { value: "suggestions", label: "Suggestions", icon: Lightbulb },
  { value: "history", label: "History", icon: History },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/**
 * Past audits for this site, newest first.
 *
 * The point of keeping history is to answer "did that fix work?", so each row
 * carries the change in score against the run before it rather than just the
 * score on its own.
 */
function HistoryPanel({
  history,
  loading,
  openId,
  onOpen,
  onDelete,
}: {
  history: SeoReportSummary[];
  loading: boolean;
  /** The report currently on screen, highlighted in the list. */
  openId: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Loader size="sm" />
        </Center>
      </Card>
    );
  }

  if (!history.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <History size={24} />
            </ThemeIcon>
            <Text fw={650}>No past audits</Text>
            <Text size="sm" c="dimmed" ta="center">
              Every audit you run is kept here, so you can confirm a fix moved the score.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const best = Math.max(...history.map((h) => h.score));

  return (
    <Card withBorder radius="md" padding={0}>
      <ScrollArea>
        <Table highlightOnHover verticalSpacing="sm" miw={680}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>URL</Table.Th>
              <Table.Th w={110}>Score</Table.Th>
              <Table.Th w={100}>Change</Table.Th>
              <Table.Th w={150}>Issues</Table.Th>
              <Table.Th w={150}>Run</Table.Th>
              <Table.Th w={56} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {history.map((h, i) => {
              const isOpen = openId === h._id;
              // History is newest-first, so the run *before* this one is the
              // next index, not the previous.
              const prev = history[i + 1];
              const delta = prev ? h.score - prev.score : null;
              return (
                <Table.Tr
                  key={h._id}
                  style={{ cursor: "pointer" }}
                  bg={isOpen ? "var(--mantine-color-default-hover)" : undefined}
                  onClick={() => onOpen(h._id)}
                >
                  <Table.Td style={{ maxWidth: 300 }}>
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm" truncate>
                        {h.url}
                      </Text>
                      {isOpen && (
                        <Badge size="xs" variant="light" color="emerald">
                          Viewing
                        </Badge>
                      )}
                      {h.score === best && history.length > 1 && (
                        <Tooltip label="Best score recorded" withArrow>
                          <ThemeIcon size={16} radius="xl" variant="light" color="yellow">
                            <Sparkles size={10} />
                          </ThemeIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="lg" variant="light" color={scoreColor(h.score)}>
                      {h.score}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {delta === null ? (
                      <Text size="xs" c="dimmed">
                        —
                      </Text>
                    ) : (
                      <Group gap={3} wrap="nowrap">
                        {delta === 0 ? (
                          <Minus size={12} style={{ opacity: 0.5 }} />
                        ) : delta > 0 ? (
                          <TrendingUp size={12} color="var(--mantine-color-teal-5)" />
                        ) : (
                          <TrendingDown size={12} color="var(--mantine-color-red-5)" />
                        )}
                        <Text
                          size="xs"
                          fw={550}
                          c={delta === 0 ? "dimmed" : delta > 0 ? "teal" : "red"}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </Text>
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={5} wrap="nowrap">
                      {h.criticalCount > 0 && (
                        <Badge size="xs" variant="light" color="red">
                          {h.criticalCount} critical
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed">
                        {h.issueCount} total
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={dateTime(h.createdAt)} withArrow>
                      <Text size="xs" c="dimmed">
                        {timeAgo(h.createdAt)}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(h._id);
                      }}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

/**
 * SEO auditing for a tracked site.
 *
 * The URL box is deliberately anchored to the selected site's domain: this is
 * an audit of a property the workspace already owns, not a general-purpose
 * scanner pointed at arbitrary hosts. The server enforces the same rule.
 */
export default function Seo() {
  const { active } = useWorkspace();
  const workspaceId = active?._id ?? "";

  const { data: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [siteId, setSiteId] = useState<string>("");
  const [path, setPath] = useState("/");
  const [tab, setTab] = useState<TabValue>("overview");
  /** Set when the user opens an older report from history. */
  const [viewingId, setViewingId] = useState<string | null>(null);

  const site = sites.find((s) => s.siteId === siteId) ?? null;

  // Settle on a site as soon as the list arrives, and follow the workspace if
  // the user switches to one where the current site does not exist.
  useEffect(() => {
    if (!sites.length) {
      setSiteId("");
      return;
    }
    setSiteId((cur) => (cur && sites.some((s) => s.siteId === cur) ? cur : sites[0].siteId));
  }, [sites]);

  // A different site means a different report; nothing from the last one applies.
  useEffect(() => {
    setViewingId(null);
    setPath("/");
  }, [siteId]);

  const [analyze, { isLoading: analyzing }] = useAnalyzeSeoMutation();
  const [deleteReport] = useDeleteSeoReportMutation();

  const { data: history = [], isLoading: historyLoading } = useGetSeoReportsQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );

  const { data: latest, isFetching: latestFetching } = useGetLatestSeoReportQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );

  const { data: viewed, isFetching: viewedFetching } = useGetSeoReportQuery(
    { workspaceId, siteId, reportId: viewingId ?? "" },
    { skip: !workspaceId || !siteId || !viewingId }
  );

  const report: SeoReport | undefined = viewingId ? viewed : latest;
  const data = report?.data;
  const loading = analyzing || latestFetching || viewedFetching;

  const targetUrl = useMemo(() => {
    if (!site) return "";
    const domain = site.domain.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `https://${domain}${suffix === "/" ? "" : suffix}`;
  }, [site, path]);

  async function run(refresh: boolean) {
    if (!site) return;
    try {
      const res = await analyze({
        workspaceId,
        siteId: site.siteId,
        url: targetUrl,
        refresh,
      }).unwrap();
      setViewingId(res.report._id);
      notify.success(
        res.cached ? "Showing the most recent audit for this URL" : "Analysis complete"
      );
    } catch (e) {
      notify.error(errMessage(e, "Analysis failed"));
    }
  }

  function remove(id: string) {
    confirmDelete({
      title: "Delete this report?",
      body: "The stored audit is removed. It does not affect the site itself.",
      confirmLabel: "Delete report",
      onConfirm: async () => {
        try {
          await deleteReport({ workspaceId, siteId, reportId: id }).unwrap();
          if (viewingId === id) setViewingId(null);
          notify.success("Report deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the report"));
        }
      },
    });
  }

  /* ------------------------------- empty states ------------------------------ */

  if (sitesLoading) {
    return (
      <AppShell>
        <PageHeader title="SEO" description="Audit a tracked site's on-page SEO." />
        <Stack gap="lg">
          <Skeleton height={92} radius="md" />
          <Skeleton height={220} radius="md" />
        </Stack>
      </AppShell>
    );
  }

  if (!sites.length) {
    return (
      <AppShell>
        <PageHeader title="SEO" description="Audit a tracked site's on-page SEO." />
        <Card withBorder radius="md" padding="xl">
          <Center>
            <Stack align="center" gap="sm" maw={420}>
              <ThemeIcon size={44} radius="xl" variant="light" color="emerald">
                <Globe size={22} />
              </ThemeIcon>
              <Text fw={600}>No sites yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                SEO audits run against the sites in this workspace. Add one first and it
                will show up here.
              </Text>
              <Button component="a" href="/app/workspaces" variant="light" color="emerald">
                Add a site
              </Button>
            </Stack>
          </Center>
        </Card>
      </AppShell>
    );
  }

  /* ---------------------------------- page ---------------------------------- */

  return (
    <AppShell>
      <PageHeader
        title="SEO"
        description="Audit a tracked site's meta tags, content, technical setup and Lighthouse scores."
        actions={
          report && (
            <Button
              variant="light"
              color="emerald"
              leftSection={<RefreshCw size={15} />}
              loading={analyzing}
              onClick={() => run(true)}
            >
              Re-run audit
            </Button>
          )
        }
      />

      <Stack gap="lg">
        <Card withBorder radius="md" padding="lg">
          <Group gap="sm" align="flex-end" wrap="wrap">
            <Select
              label="Site"
              data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
              value={siteId}
              onChange={(v) => v && setSiteId(v)}
              allowDeselect={false}
              w={{ base: "100%", sm: 220 }}
              leftSection={<Globe size={15} />}
            />
            <TextInput
              label="Path"
              description={site ? `Audits ${targetUrl}` : undefined}
              value={path}
              onChange={(e) => setPath(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && !analyzing && run(false)}
              placeholder="/"
              style={{ flex: "1 1 240px", minWidth: 200 }}
            />
            <Button
              color="emerald"
              leftSection={<Search size={15} />}
              loading={analyzing}
              onClick={() => run(false)}
            >
              Analyze
            </Button>
          </Group>
          {analyzing && (
            <Alert color="gray" variant="light" mt="md" icon={<Info size={15} />}>
              Running the Lighthouse audit through Google PageSpeed. This usually takes
              20-60 seconds.
            </Alert>
          )}
        </Card>

        {!report && !loading && (
          <Card withBorder radius="md" padding="xl">
            <Center>
              <Stack align="center" gap="sm" maw={420}>
                <ThemeIcon size={44} radius="xl" variant="light" color="emerald">
                  <Sparkles size={22} />
                </ThemeIcon>
                <Text fw={600}>No audit yet</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Run an analysis to see meta tags, content quality, technical checks and
                  Lighthouse scores for this page.
                </Text>
              </Stack>
            </Center>
          </Card>
        )}

        {loading && !data && (
          <Stack gap="lg">
            <Skeleton height={180} radius="md" />
            <Skeleton height={280} radius="md" />
          </Stack>
        )}

        {data && report && (
          <>
            <Group justify="space-between" wrap="wrap" gap="xs">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <Anchor
                  href={data.finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  truncate
                  maw={420}
                >
                  {data.finalUrl}
                </Anchor>
                <ExternalLink size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
                {data.finalUrl !== data.url && (
                  <Tooltip label={`Redirected from ${data.url}`} withArrow>
                    <Badge size="xs" variant="light" color="yellow">
                      redirected
                    </Badge>
                  </Tooltip>
                )}
              </Group>
              <Tooltip label={dateTime(report.createdAt)} withArrow>
                <Text size="xs" c="dimmed">
                  Audited {timeAgo(report.createdAt)}
                </Text>
              </Tooltip>
            </Group>

            <ScorePanel
              score={data.score}
              performance={data.performance}
              issues={data.issues}
            />

            <Box className="seo-tabbar">
              {TABS.map((t) => {
                const activeTab = tab === t.value;
                const Icon = t.icon;
                const count =
                  t.value === "overview"
                    ? data.issues.length
                    : t.value === "suggestions"
                    ? data.performance.suggestions.length
                    : t.value === "history"
                    ? history.length
                    : 0;
                return (
                  <Button
                    key={t.value}
                    size="sm"
                    radius="md"
                    variant={activeTab ? "filled" : "subtle"}
                    color={activeTab ? "emerald" : "gray"}
                    leftSection={<Icon size={14} />}
                    onClick={() => setTab(t.value)}
                    style={{ flex: "0 0 auto" }}
                    rightSection={
                      count > 0 ? (
                        <Badge
                          size="xs"
                          circle
                          variant={activeTab ? "white" : "light"}
                          color={activeTab ? "emerald" : "gray"}
                        >
                          {count}
                        </Badge>
                      ) : undefined
                    }
                  >
                    {t.label}
                  </Button>
                );
              })}
            </Box>

            {tab === "overview" && (
              <Stack gap="md">
                {data.issues.some((i) => i.severity === "critical") && (
                  <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
                    {data.issues.filter((i) => i.severity === "critical").length} critical
                    issue(s) are holding this page back. Fix those first.
                  </Alert>
                )}
                <IssueList issues={data.issues} />
              </Stack>
            )}
            {tab === "meta" && <MetaPanel meta={data.meta} url={data.finalUrl} />}
            {tab === "content" && <ContentPanel content={data.content} />}
            {tab === "technical" && (
              <TechnicalPanel
                technical={data.technical}
                performance={data.performance}
                siteFiles={data.siteFiles}
              />
            )}
            {tab === "suggestions" && <SuggestionsPanel performance={data.performance} />}
            {tab === "history" && (
              <HistoryPanel
                history={history}
                loading={historyLoading}
                openId={report._id}
                onOpen={setViewingId}
                onDelete={remove}
              />
            )}
          </>
        )}
      </Stack>
      <Box h="xl" />
    </AppShell>
  );
}
