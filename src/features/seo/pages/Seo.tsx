import { useEffect, useMemo, useState } from "react";
import {
  Anchor, Badge, Box, Button, Card, Center, Group, Loader, Select, Stack,
  Table, Text, TextInput, ThemeIcon, Tooltip, ActionIcon, ScrollArea, Skeleton,
  UnstyledButton, Pagination,
} from "@mantine/core";
import {
  Search, RefreshCw, Globe, History, Trash2, Trophy,
  ListChecks, Tags, FileText, Wrench, Lightbulb, ExternalLink,
  TrendingUp, TrendingDown, Minus, Braces, Link2, Layers, Printer,
  HelpCircle, Bot,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { RunningDialog } from "@/shared/ui/RunningDialog";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { getSeoHelp } from "@/features/seo/components/help";
import { PageHeader } from "@/shared/ui/Page";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import {
  useGetSitesQuery, useAnalyzeSeoMutation, useGetSeoReportsQuery,
  useGetLatestSeoReportQuery, useGetSeoReportQuery, useDeleteSeoReportMutation,
  useGetSearchTrafficQuery, useGetFieldVitalsQuery,
  useRunCrawlMutation, useGetLatestCrawlQuery,
} from "@/app/store";
import { notify, errMessage, notifyError, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { timeAgo, dateTime } from "@/shared/lib";
import { scoreColor } from "@/features/seo/components/ScoreRing";
import { SchemaPanel } from "@/features/seo/components/SchemaPanel";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinksPanel } from "@/features/seo/components/LinksPanel";
import { SearchPanel } from "@/features/seo/components/SearchPanel";
import { VitalsPanel } from "@/features/seo/components/VitalsPanel";
import { CrawlPanel } from "@/features/seo/components/CrawlPanel";
import {
  OverviewPanel, MetaPanel, ContentPanel, TechnicalPanel, SuggestionsPanel, AiSearchPanel,
} from "@/features/seo/components/SeoPanels";
import type { SeoReport, SeoReportSummary } from "@/shared/types";

const TABS = [
  { value: "overview", label: "Overview", icon: ListChecks },
  { value: "meta", label: "Meta tags", icon: Tags },
  { value: "content", label: "Content", icon: FileText },
  { value: "technical", label: "Technical", icon: Wrench },
  { value: "links", label: "Links", icon: Link2 },
  { value: "schema", label: "Schema", icon: Braces },
  { value: "ai", label: "AI search", icon: Bot },
  { value: "crawl", label: "Crawl", icon: Layers },
  { value: "search", label: "Search", icon: Search },
  { value: "suggestions", label: "Suggestions", icon: Lightbulb },
  { value: "history", label: "History", icon: History },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/**
 * How many past audits to fetch, and how many to show per page.
 *
 * The history rows omit the report body, so 200 of them is a small payload —
 * cheaper to fetch once and page through on the client than to round-trip per
 * page, and it keeps the score-trend sparkline working off the full series.
 */
const HISTORY_LIMIT = 200;
const HISTORY_PAGE_SIZE = 15;

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
  /** Null for a viewer, who keeps the full history but cannot remove a run. */
  onDelete: ((id: string) => void) | null;
}) {
  const [page, setPage] = useState(1);

  // A deleted run can leave the last page empty; step back rather than showing
  // an empty table under a page number that no longer exists.
  const pageCount = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const current = Math.min(page, pageCount);

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
      <EmptyState
        compact
        icon={History}
        title="No past audits"
        description="Every audit you run is kept here, so you can confirm a fix moved the score."
      />
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
              {onDelete && <Table.Th w={56} />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {history
              .slice((current - 1) * HISTORY_PAGE_SIZE, current * HISTORY_PAGE_SIZE)
              .map((h, pageIndex) => {
              // Indexed against the whole history, not the page slice, so the
              // first row of page 2 still compares to the last row of page 1.
              const i = (current - 1) * HISTORY_PAGE_SIZE + pageIndex;
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
                            <Trophy size={10} />
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
                  {onDelete && (
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
                  )}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Hidden on a single page: a pager that can only ever say "1 of 1" is
          noise, not navigation. */}
      {pageCount > 1 && (
        <Group justify="space-between" px="md" py="sm" wrap="nowrap" className="seo-history-pager">
          <Text size="xs" c="dimmed">
            {(current - 1) * HISTORY_PAGE_SIZE + 1}–
            {Math.min(current * HISTORY_PAGE_SIZE, history.length)} of {history.length}
          </Text>
          <Pagination
            size="sm"
            value={current}
            onChange={setPage}
            total={pageCount}
            withEdges={pageCount > 5}
          />
        </Group>
      )}
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
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { user, refreshUser } = useAuth();
  const workspaceId = active?._id ?? "";

  // `currentData`, not `data`: the latter holds the previous workspace's sites
  // across the switch, which would offer a site picker full of properties this
  // workspace doesn't own.
  const { currentData: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });

  /**
   * The site the user picked, if any. Not the source of truth — see `siteId`.
   *
   * Holding only the *choice* here, and resolving it against the current
   * workspace's list below, is what keeps a workspace switch from firing
   * requests at the previous workspace's site. Storing the resolved id in state
   * instead meant a render happened with the stale value before any effect
   * could clear it, and every query keyed on it went out and 404'd.
   */
  const [picked, setPicked] = useState<string>("");
  const [path, setPath] = useState("/");
  const [tab, setTab] = useState<TabValue>("overview");
  /** Set when the user opens an older report from history. */
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  /**
   * The site actually being audited, derived during render rather than stored.
   *
   * A pick only counts while it names a site in the workspace currently loaded;
   * otherwise this falls back to the first site, or to empty while the list is
   * still in flight. Because it is computed, the very first render after a
   * switch already has the right value, and every query below either targets a
   * real site or skips.
   */
  const site = sites.find((s) => s.siteId === picked) ?? sites[0] ?? null;
  const siteId = site?.siteId ?? "";

  // A different site means a different report; nothing from the last one
  // applies. Keyed on the resolved id, so it also fires when a workspace switch
  // lands on a different site.
  useEffect(() => {
    setViewingId(null);
    setPath("/");
  }, [siteId]);

  const [analyze, { isLoading: analyzing }] = useAnalyzeSeoMutation();
  const [deleteReport] = useDeleteSeoReportMutation();

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
    trace(user?.id, "run_site_crawl", "seo", "crawl");
    try {
      await runCrawl({ workspaceId, siteId }).unwrap();
      notify.success("Crawl complete");
      // A crawl always spends quota, so the sidebar/Billing numbers are stale
      // the instant this resolves — pull the fresh count now rather than
      // waiting for the next unrelated `/me` refetch.
      await refreshUser();
    } catch (e) {
      notifyError(e, "Crawl failed");
    }
  }

  // The default limit is 20, which silently truncated the History tab on any
  // site audited regularly — the older runs existed but were unreachable.
  const { data: history = [], isLoading: historyLoading } = useGetSeoReportsQuery(
    { workspaceId, siteId, limit: HISTORY_LIMIT },
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
    trace(user?.id, refresh ? "rerun_seo_audit" : "run_seo_audit", "seo", "seo_report");
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
      // A cache hit costs no quota — only refresh when a real audit ran.
      if (!res.cached) await refreshUser();
    } catch (e) {
      notifyError(e, "Analysis failed");
    }
  }

  function remove(id: string) {
    confirmDelete({
      title: "Delete this report?",
      body: "The stored audit is removed. It does not affect the site itself.",
      confirmLabel: "Delete report",
      onConfirm: async () => {
        trace(user?.id, "delete_seo_report", "seo_history", "seo");
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
        <EmptyState
          icon={Globe}
          title="No sites yet"
          description="SEO audits run against the sites in this workspace. Add one first and it will show up here."
          action={{ label: "Add a site", onClick: () => { window.location.href = "/app/workspaces"; } }}
        />
      </AppShell>
    );
  }


  return (
    <AppShell>
      <RunningDialog
        opened={analyzing}
        title="Running SEO audit"
        description={
          <>
            {targetUrl || "This page"} — usually 20-60 seconds.
          </>
        }
        icon={<Search size={20} />}
        minimizedLabel="Running SEO audit…"
        successMessage="SEO audit complete"
        steps={[
          "Fetching the page…",
          "Parsing meta tags and headings…",
          "Checking technical setup…",
          "Running Lighthouse…",
          "Scoring and building the report…",
        ]}
      />

      <PageHeader
        title="SEO"
        description="Audit a tracked site's meta tags, content, technical setup and Lighthouse scores."
        actions={
          report && (
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<Printer size={15} />}
                component="a"
                href={`/app/seo/${siteId}/report/${report._id}/print`}
                target="_blank"
              >
                Export report
              </Button>
              {canEdit && (
                <Button
                  variant="light"
                  color="emerald"
                  leftSection={<RefreshCw size={15} />}
                  disabled={analyzing}
                  onClick={() => run(true)}
                >
                  Re-run audit
                </Button>
              )}
            </Group>
          )
        }
      />

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
              onChange={(v) => v && setPicked(v)}
              allowDeselect={false}
              w={{ base: "100%", sm: 240 }}
              leftSection={<Globe size={15} />}
              comboboxProps={{ radius: "md" }}
              radius="md"
            />

            {canEdit && (
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
            )}

            {canEdit && (
              <Button
                color="emerald"
                leftSection={<Search size={15} />}
                disabled={analyzing}
                onClick={() => run(false)}
                radius="md"
                w={{ base: "100%", sm: "auto" }}
              >
                Analyze
              </Button>
            )}
          </Group>

          {/* Spell out the URL that will actually be fetched, so a typo in the
              path is visible before spending a minute on the audit. */}
          {canEdit && targetUrl && !analyzing && (
            <Group gap={6} mt="sm" wrap="nowrap">
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                Audits
              </Text>
              <Text size="xs" c="dimmed" fw={500} truncate>
                {targetUrl}
              </Text>
            </Group>
          )}

        </Card>

        {!report && !loading && (
          <EmptyState
            icon={Search}
            title="No audit yet"
            description={
              canEdit
                ? "Run an analysis to see meta tags, content quality, technical checks and Lighthouse scores for this page."
                : "Nobody has audited this site yet. An editor can run the first analysis."
            }
          />
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
              <Tooltip label={t("help.seo.tabTooltip")} withArrow position="left">
                <ActionIcon
                  className="seo-tab-help"
                  variant="subtle"
                  color="gray"
                  onClick={() => setHelpOpen(true)}
                  aria-label={t("help.seo.tabAria")}
                >
                  <HelpCircle size={17} />
                </ActionIcon>
              </Tooltip>
            </Box>

            <HelpDrawer
              opened={helpOpen}
              onClose={() => setHelpOpen(false)}
              title={t("help.seo.title")}
              sections={getSeoHelp(t)}
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
            {tab === "ai" && <AiSearchPanel aiSearch={data.aiSearch} />}
            {tab === "crawl" && (
              <CrawlPanel
                report={crawlReport}
                running={crawling}
                onCrawl={canEdit ? startCrawl : null}
              />
            )}
            {tab === "search" && (
              <SearchPanel traffic={searchTraffic} loading={searchLoading} />
            )}
            {tab === "suggestions" && <SuggestionsPanel performance={data.performance} />}
            {tab === "history" && (
              <HistoryPanel
                history={history}
                loading={historyLoading}
                openId={report._id}
                onOpen={setViewingId}
                onDelete={canEdit ? remove : null}
              />
            )}
          </Stack>
        )}
      </Stack>
      <Box h="xl" />
    </AppShell>
  );
}
