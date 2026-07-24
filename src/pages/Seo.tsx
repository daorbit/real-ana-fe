import { useEffect, useMemo, useState } from "react";
import {
  Alert, Anchor, Badge, Box, Button, Card, Center, Group, Loader, Select, Stack,
  Table, Text, TextInput, ThemeIcon, Tooltip, ActionIcon, ScrollArea, Skeleton,
  UnstyledButton,
} from "@mantine/core";
import {
  Search, RefreshCw, Globe, History, Trash2, Sparkles, Info,
  ListChecks, Tags, FileText, Wrench, Lightbulb, ExternalLink,
  TrendingUp, TrendingDown, Minus, Braces, Link2, Swords, Layers, Printer, Share2,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { HelpDrawer } from "../components/HelpDrawer";
import { SEO_HELP } from "../components/seo/help";
import { PageHeader } from "../components/Page";
import { useWorkspace } from "../workspace";
import {
  useGetSitesQuery, useAnalyzeSeoMutation, useGetSeoReportsQuery,
  useGetLatestSeoReportQuery, useGetSeoReportQuery, useDeleteSeoReportMutation,
  useGetCompetitorsQuery, useAddCompetitorMutation, useRefreshCompetitorMutation,
  useDeleteCompetitorMutation, useGetSearchTrafficQuery, useGetFieldVitalsQuery,
  useRunCrawlMutation, useGetLatestCrawlQuery,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { timeAgo, dateTime } from "../utils";
import { scoreColor } from "../components/seo/ScoreRing";
import { SchemaPanel } from "../components/seo/SchemaPanel";
import { LinksPanel } from "../components/seo/LinksPanel";
import { ComparePanel } from "../components/seo/ComparePanel";
import { SearchPanel } from "../components/seo/SearchPanel";
import { VitalsPanel } from "../components/seo/VitalsPanel";
import { CrawlPanel } from "../components/seo/CrawlPanel";
import { SeoShareModal } from "../components/seo/SeoShareModal";
import {
  OverviewPanel, MetaPanel, ContentPanel, TechnicalPanel, SuggestionsPanel,
} from "../components/seo/SeoPanels";
import type { SeoReport, SeoReportSummary } from "../types";

const TABS = [
  { value: "overview", label: "Overview", icon: ListChecks },
  { value: "meta", label: "Meta tags", icon: Tags },
  { value: "content", label: "Content", icon: FileText },
  { value: "technical", label: "Technical", icon: Wrench },
  { value: "links", label: "Links", icon: Link2 },
  { value: "schema", label: "Schema", icon: Braces },
  { value: "crawl", label: "Crawl", icon: Layers },
  { value: "search", label: "Search", icon: Search },
  { value: "compare", label: "Compare", icon: Swords },
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
  const [shareOpen, setShareOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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

  const { data: competitors = [], isLoading: competitorsLoading } = useGetCompetitorsQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );
  const { data: searchTraffic, isLoading: searchLoading } = useGetSearchTrafficQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );

  const { data: fieldVitals } = useGetFieldVitalsQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );

  const { data: crawlReport } = useGetLatestCrawlQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );
  const [runCrawl, { isLoading: crawling }] = useRunCrawlMutation();

  async function startCrawl() {
    try {
      await runCrawl({ workspaceId, siteId }).unwrap();
      notify.success("Crawl complete");
    } catch (e) {
      notify.error(errMessage(e, "Crawl failed"));
    }
  }

  const [addCompetitor, { isLoading: addingCompetitor }] = useAddCompetitorMutation();
  const [refreshCompetitor] = useRefreshCompetitorMutation();
  const [deleteCompetitor] = useDeleteCompetitorMutation();

  async function addCompetitorUrl(url: string) {
    try {
      await addCompetitor({ workspaceId, siteId, url }).unwrap();
      notify.success("Competitor added");
    } catch (e) {
      notify.error(errMessage(e, "Could not fetch that URL"));
    }
  }

  async function refreshOne(competitorId: string) {
    try {
      await refreshCompetitor({ workspaceId, siteId, competitorId }).unwrap();
      notify.success("Competitor refreshed");
    } catch (e) {
      notify.error(errMessage(e, "Could not refresh that competitor"));
    }
  }

  function removeCompetitor(competitorId: string) {
    confirmDelete({
      title: "Remove this competitor?",
      body: "The stored comparison is deleted. You can add the URL again later.",
      confirmLabel: "Remove",
      onConfirm: async () => {
        try {
          await deleteCompetitor({ workspaceId, siteId, competitorId }).unwrap();
          notify.success("Competitor removed");
        } catch (e) {
          notify.error(errMessage(e, "Could not remove that competitor"));
        }
      },
    });
  }

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

  /** The site's bare hostname, shown as a fixed prefix on the path field. */
  const domainLabel = useMemo(
    () => (site ? site.domain.replace(/^https?:\/\//i, "").replace(/\/$/, "") : ""),
    [site]
  );

  const targetUrl = useMemo(() => {
    if (!domainLabel) return "";
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `https://${domainLabel}${suffix === "/" ? "" : suffix}`;
  }, [domainLabel, path]);

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
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<Share2 size={15} />}
                onClick={() => setShareOpen(true)}
              >
                Share
              </Button>
              <Button
                variant="default"
                leftSection={<Printer size={15} />}
                component="a"
                href={`/app/seo/${siteId}/report/${report._id}/print`}
                target="_blank"
              >
                Export report
              </Button>
              <Button
                variant="light"
                color="emerald"
                leftSection={<RefreshCw size={15} />}
                loading={analyzing}
                onClick={() => run(true)}
              >
                Re-run audit
              </Button>
            </Group>
          )
        }
      />

      {report && (
        <SeoShareModal
          opened={shareOpen}
          onClose={() => setShareOpen(false)}
          workspaceId={workspaceId}
          siteId={siteId}
          reportId={report._id}
        />
      )}

      <Stack gap="lg">
        <Card withBorder radius="md" padding="lg">
          {/* Labels sit on one baseline and the domain is a fixed prefix inside
              the path field, so the thing being audited reads as one address
              rather than three controls that happen to be adjacent. */}
          <Group gap="md" align="flex-end" wrap="wrap">
            <Select
              label="Site"
              data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
              value={siteId}
              onChange={(v) => v && setSiteId(v)}
              allowDeselect={false}
              w={{ base: "100%", sm: 240 }}
              leftSection={<Globe size={15} />}
              comboboxProps={{ radius: "md" }}
              radius="md"
            />

            <Box style={{ flex: "1 1 320px", minWidth: 240 }}>
              <Text component="label" htmlFor="seo-path" size="sm" fw={500} display="block" mb={4}>
                Page to audit
              </Text>
              <TextInput
                id="seo-path"
                value={path}
                onChange={(e) => setPath(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && !analyzing && run(false)}
                placeholder="/"
                radius="md"
                leftSectionWidth={domainLabel ? Math.min(260, domainLabel.length * 7.4 + 22) : 0}
                leftSectionPointerEvents="none"
                leftSection={
                  domainLabel ? (
                    <Text size="sm" c="dimmed" pl="sm" truncate style={{ maxWidth: 240 }}>
                      {domainLabel}
                    </Text>
                  ) : undefined
                }
                styles={{ section: { justifyContent: "flex-start" } }}
              />
            </Box>

            <Button
              color="emerald"
              leftSection={<Search size={15} />}
              loading={analyzing}
              onClick={() => run(false)}
              radius="md"
              w={{ base: "100%", sm: "auto" }}
            >
              Analyze
            </Button>
          </Group>

          {/* Spell out the URL that will actually be fetched, so a typo in the
              path is visible before spending a minute on the audit. */}
          {targetUrl && !analyzing && (
            <Group gap={6} mt="sm" wrap="nowrap">
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                Audits
              </Text>
              <Text size="xs" c="dimmed" fw={500} truncate>
                {targetUrl}
              </Text>
            </Group>
          )}

          {analyzing && (
            <Alert color="gray" variant="light" mt="md" radius="md" icon={<Info size={15} />}>
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
          <Stack className="seo-report" gap="lg">
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

            <Box className="seo-tabbar">
              <Box className="seo-tabbar-track">
                {TABS.map((t) => {
                  const activeTab = tab === t.value;
                  const Icon = t.icon;
                  const count =
                    t.value === "overview"
                      ? data.issues.length
                      : t.value === "suggestions"
                      ? data.performance.suggestions.length
                      : t.value === "links"
                      ? (data.links?.broken ?? 0) + (data.links?.serverErrors ?? 0)
                      : t.value === "schema"
                      ? data.schema?.errorCount ?? 0
                      : t.value === "history"
                      ? history.length
                      : 0;
                  // Counts that flag a problem (broken links, schema errors,
                  // critical issues) read red; neutral tallies stay grey.
                  const alarm =
                    (t.value === "links" || t.value === "schema") && count > 0;
                  return (
                    <UnstyledButton
                      key={t.value}
                      className="seo-tab"
                      data-active={activeTab || undefined}
                      onClick={() => setTab(t.value)}
                    >
                      <Icon size={15} className="seo-tab-icon" />
                      <span className="seo-tab-label">{t.label}</span>
                      {count > 0 && (
                        <span
                          className="seo-tab-count"
                          data-alarm={alarm || undefined}
                        >
                          {count}
                        </span>
                      )}
                    </UnstyledButton>
                  );
                })}
              </Box>
              {/* Help for the current tab. Opens the shared drawer selected to
                  whatever tab you're on, so the relevant explanation is already
                  on screen. */}
              <Tooltip label="What this tab shows" withArrow position="left">
                <ActionIcon
                  className="seo-tab-help"
                  variant="subtle"
                  color="gray"
                  onClick={() => setHelpOpen(true)}
                  aria-label="Help for this tab"
                >
                  <HelpCircle size={17} />
                </ActionIcon>
              </Tooltip>
            </Box>

            <HelpDrawer
              opened={helpOpen}
              onClose={() => setHelpOpen(false)}
              title="SEO report help"
              sections={SEO_HELP}
              initialId={tab}
            />

            {tab === "overview" && (
              <OverviewPanel
                data={{
                  score: data.score,
                  performance: data.performance,
                  issues: data.issues,
                  content: data.content,
                  technical: data.technical,
                  siteFiles: data.siteFiles,
                }}
                history={history}
              />
            )}
            {tab === "meta" && <MetaPanel meta={data.meta} url={data.finalUrl} />}
            {tab === "content" && <ContentPanel content={data.content} />}
            {tab === "technical" && (
              <TechnicalPanel
                technical={data.technical}
                performance={data.performance}
                siteFiles={data.siteFiles}
                vitals={<VitalsPanel vitals={fieldVitals} />}
              />
            )}
            {tab === "links" && <LinksPanel links={data.links} />}
            {tab === "schema" && <SchemaPanel schema={data.schema} />}
            {tab === "crawl" && (
              <CrawlPanel report={crawlReport} running={crawling} onCrawl={startCrawl} />
            )}
            {tab === "search" && (
              <SearchPanel traffic={searchTraffic} loading={searchLoading} />
            )}
            {tab === "compare" && (
              <ComparePanel
                data={data}
                siteName={site?.name ?? "This site"}
                competitors={competitors}
                loading={competitorsLoading}
                adding={addingCompetitor}
                onAdd={addCompetitorUrl}
                onRefresh={refreshOne}
                onDelete={removeCompetitor}
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
          </Stack>
        )}
      </Stack>
      <Box h="xl" />
    </AppShell>
  );
}
