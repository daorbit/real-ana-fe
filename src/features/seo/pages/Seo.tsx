import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Badge, Box, Button, Card, Modal, Group,
  Table, Text, ThemeIcon, Tooltip, ActionIcon, ScrollArea, Skeleton,
  Pagination,
} from "@mantine/core";
import {
  RefreshCw, History, Trash2, Trophy,
  TrendingUp, TrendingDown, Minus, Printer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { AuditCrawlView } from "@/features/seo/components/audit/AuditCrawlView";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { getSeoHelp } from "@/features/seo/components/help";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import {
  demoSites, demoSeoReport, demoSeoHistory, demoCrawl, demoVitals,
} from "@/features/demo/demoData";
import { SeoInspectBar } from "@/features/seo/components/layout/SeoInspectBar";
import { SeoStartPanel } from "@/features/seo/components/start/SeoStartPanel";
import { SeoNoSitePanel } from "@/features/seo/components/start/SeoNoSitePanel";
import { SitesLoadError } from "@/features/workspace";
import {
  useGetSitesQuery, useAnalyzeSeoMutation, useGetSeoReportsQuery,
  useGetLatestSeoReportQuery, useGetSeoReportQuery, useDeleteSeoReportMutation,
  useGetFieldVitalsQuery,
  useRunCrawlMutation, useGetLatestCrawlQuery,
} from "@/app/store";
import { notify, errMessage, notifyError, confirmDelete } from "@/shared/lib/notify";
import { useAuth } from "@/features/auth/context";
import { timeAgo, dateTime } from "@/shared/lib";
import { scoreColor } from "@/features/seo/components/ScoreRing";
import { SchemaPanel } from "@/features/seo/components/SchemaPanel";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinksPanel } from "@/features/seo/components/LinksPanel";
import { VitalsPanel } from "@/features/seo/components/VitalsPanel";
import { CrawlPanel } from "@/features/seo/components/CrawlPanel";
import {
  OverviewPanel, MetaPanel, ContentPanel, ImagesPanel, TechnicalPanel, PerformancePanel,
  SuggestionsPanel, AiSearchPanel, IssuesPanel, collectIssues,
} from "@/features/seo/components/SeoPanels";
import type { SeoReport, SeoReportSummary } from "@/shared/types";
import {
  SEO_TABS, isSeoTab, resolveSeoSection, seoTabPath, type SeoSubId, type SeoTabId,
} from "@/features/seo/components/sections";
import { SeoInspectSkeleton, SeoTabSkeleton } from "@/features/seo/components/layout/SeoSkeletons";
import { Bricks } from "@/shared/ui/Bricks";
import { brickRows } from "@/shared/lib/brickRows";
import { SeoHelpLink, SeoTabIntro, type SeoTabCount } from "@/features/seo/components/layout/SeoTabs";
import { SeoTabBar } from "@/features/seo/components/layout/SeoTabBar";
import { useSeoPages } from "@/features/seo/hooks/useSeoPages";
import {
  SEO_PAGE_PARAM, SEO_SITE_PARAM, normalizePagePath, pageAddress, pickSeoSite, seoPageSearch,
} from "@/features/seo/lib/seoPageParams";
import { ReportMeta } from "@/features/seo/components/layout/ReportMeta";
import layout from "@/features/seo/components/layout/SeoLayout.module.css";
import { useTitle } from "@/shared/lib/useTitle";

const HISTORY_LIMIT = 200;
const HISTORY_PAGE_SIZE = 15;
const HISTORY_LOADING_ROWS = brickRows(4, 48);

function HistoryPanel({
  history,
  loading,
  openId,
  onOpen,
  onDelete,
}: {
  history: SeoReportSummary[];
  loading: boolean;
  openId: string;
  onOpen: (id: string) => void;
  onDelete: ((id: string) => void) | null;
}) {
  const [page, setPage] = useState(1);


  const pageCount = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const current = Math.min(page, pageCount);

  if (loading) {
    return (
      <Bricks rows={HISTORY_LOADING_ROWS} label="Loading report history" />
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
                      <Tooltip label="Delete audit" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          aria-label="Delete audit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(h._id);
                          }}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Tooltip>
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


/** One block of a grouped tab, with its own heading and a jump-link target. */
function Block({ id, children }: { id: SeoSubId; children: ReactNode }) {
  const sub = SEO_TABS.flatMap((x) => x.subs ?? []).find((x) => x.id === id);
  return (
    <section id={`seo-block-${id}`} className={layout.block} aria-labelledby={`seo-block-${id}-title`}>
      <header className={layout.blockHead}>
        <h3 id={`seo-block-${id}-title`} className={layout.blockTitle}>{sub?.label}</h3>
        {sub?.description && <p className={layout.blockDesc}>{sub.description}</p>}
      </header>
      {children}
    </section>
  );
}

export default function Seo() {
  useTitle("SEO");
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { refreshUser } = useAuth();
  const workspaceId = active?._id ?? "";
  const { demo } = useDemo();

  const {
    currentData: realSites = [], isLoading: realSitesLoading, isError: realSitesFailed,
    isFetching: sitesFetching, refetch: refetchSites,
  } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });
  const sites = demo ? demoSites : realSites;
  const sitesLoading = !demo && realSitesLoading;
  const sitesFailed = !demo && realSitesFailed;

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const page = normalizePagePath(params.get(SEO_PAGE_PARAM));
  const [path, setPath] = useState(page);
  const { tab: pathTab } = useParams();
  const legacySection = params.get("section");
  const resolved = resolveSeoSection(legacySection);
  const tab: SeoTabId = isSeoTab(pathTab) ? pathTab : resolved.tab;

  useEffect(() => {
    const badPath = pathTab !== undefined && !isSeoTab(pathTab);
    const tabInQuery = isSeoTab(legacySection);
    if (!badPath && !tabInQuery) return;
    const out = new URLSearchParams(window.location.search);
    if (tabInQuery) out.delete("section");
    const query = out.toString();
    navigate(`${seoTabPath(tab)}${query ? `?${query}` : ""}`, { replace: true });
  }, [pathTab, legacySection, tab, navigate]);
  const tabDef = SEO_TABS.find((x) => x.id === tab) ?? SEO_TABS[0];

  // Tabs stay mounted once opened, so switching back is instant and keeps
  // whatever was expanded or scrolled inside them.
  const [visited, setVisited] = useState<Set<SeoTabId>>(() => new Set([tab]));
  useEffect(() => {
    setVisited((v) => (v.has(tab) ? v : new Set(v).add(tab)));
  }, [tab]);

  /** Sits just above the tab bar: where the page scrolls back to on a switch. */
  const tabsTop = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(Boolean(resolved.history));

  const jumpTo = (sub: SeoSubId) => {
    // After the tab's content is on screen, for a jump that also switched tab.
    requestAnimationFrame(() =>
      document.getElementById(`seo-block-${sub}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const setTab = (next: SeoTabId) => {
    const out = new URLSearchParams(window.location.search);
    out.delete("section");
    const query = out.toString();
    navigate(`${seoTabPath(next)}${query ? `?${query}` : ""}`);
    // Only when the reader is below the tabs: the new tab then starts right
    // under them instead of halfway down, and a switch near the top of the
    // page doesn't move anything at all.
    const top = tabsTop.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
  };
  /** Set when the user opens an older report from history. */
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);


  const site = pickSeoSite(sites, params.get(SEO_SITE_PARAM));
  const siteId = site?.siteId ?? "";
  const pendingView = useRef<string | null>(null);

  useEffect(() => {
    setViewingId(pendingView.current);
    pendingView.current = null;
    setPath(page);
  }, [siteId, page]);

  const selectPage = (nextSite: string, nextPath: string, reportId: string | null = null) => {
    const next = normalizePagePath(nextPath);
    if (nextSite === siteId && next === page) {
      setViewingId(reportId);
      setPath(next);
      return;
    }
    pendingView.current = reportId;
    navigate(`${window.location.pathname}${seoPageSearch(window.location.search, nextSite, next)}`);
  };

  const [analyze, { isLoading: analyzing }] = useAnalyzeSeoMutation();
  const auditRequest = useRef<{ abort: () => void } | null>(null);
  const auditCancelled = useRef(false);
  const [deleteReport] = useDeleteSeoReportMutation();

  const { data: realFieldVitals } = useGetFieldVitalsQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );
  const fieldVitals = demo ? demoVitals : realFieldVitals;

  const { data: realCrawlReport } = useGetLatestCrawlQuery(
    { workspaceId, siteId },
    { skip: !workspaceId || !siteId }
  );
  const crawlReport = demo ? demoCrawl : realCrawlReport;
  const [runCrawl, { isLoading: crawling }] = useRunCrawlMutation();

  async function startCrawl() {
    if (demo) {
      notify.error("Turn off demo data to run a crawl.");
      return;
    }
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
  const { data: realHistory = [], isLoading: realHistoryLoading } = useGetSeoReportsQuery(
    { workspaceId, siteId, limit: HISTORY_LIMIT },
    { skip: !workspaceId || !siteId }
  );
  const history = demo ? demoSeoHistory : realHistory;
  const historyLoading = !demo && realHistoryLoading;
  const seoPages = useSeoPages(workspaceId, siteId);
  const pageHistory = useMemo(
    () => history.filter((h) => normalizePagePath(h.url) === page),
    [history, page]
  );

  const domainLabel = useMemo(
    () => (site ? site.domain.replace(/^https?:\/\//i, "").replace(/\/$/, "") : ""),
    [site]
  );
  const pageUrl = domainLabel ? pageAddress(domainLabel, page) : "";

  const {
    currentData: realLatest, data: lastLatest, isFetching: realLatestFetching,
  } = useGetLatestSeoReportQuery(
    { workspaceId, siteId, url: pageUrl },
    { skip: !workspaceId || !siteId || !pageUrl || demo }
  );
  const heldLatest =
    !realLatest && realLatestFetching && lastLatest?.siteId === siteId ? lastLatest : undefined;
  const switchingPage = Boolean(heldLatest) && !viewingId;
  const latest = demo ? demoSeoReport : realLatest ?? heldLatest;
  const latestFetching = !demo && realLatestFetching;

  // History beyond the latest run has no full report fixture behind it (just
  // the summary row for the trend chart), so opening an older audit in demo
  // mode still shows the one report fixture there is.
  const { data: viewed, isFetching: realViewedFetching } = useGetSeoReportQuery(
    { workspaceId, siteId, reportId: viewingId ?? "" },
    { skip: !workspaceId || !siteId || !viewingId || demo }
  );
  const viewedFetching = !demo && realViewedFetching;

  const report: SeoReport | undefined = demo ? demoSeoReport : viewingId ? viewed : latest;
  const data = report?.data;
  const loading = analyzing || latestFetching || viewedFetching;

  // Every finding from every checker, not just the on-page ones — the Issues
  // tab's badge counts the same list the tab itself renders.
  const allIssues = useMemo(() => (data ? collectIssues(data) : []), [data]);

  // Counts that flag a problem (broken links, schema errors, critical issues)
  // read red; neutral tallies stay grey.
  const tabCounts: Partial<Record<SeoTabId, SeoTabCount>> = data
    ? {
        issues: {
          value: allIssues.length,
          alarm: allIssues.some((i) => i.severity === "critical"),
        },
        onpage: { value: data.schema?.errorCount ?? 0, alarm: true },
        performance: { value: data.performance.suggestions.length },
        site: {
          value: (data.links?.broken ?? 0) + (data.links?.serverErrors ?? 0),
          alarm: true,
        },
      }
    : {};

  // A link to an old single section (?section=images) lands on its block.
  const initialSub = useRef(resolved.sub);
  useEffect(() => {
    if (data && initialSub.current) {
      jumpTo(initialSub.current);
      initialSub.current = undefined;
    }
  }, [data]);

  const targetUrl = domainLabel ? pageAddress(domainLabel, normalizePagePath(path)) : "";

  async function run(refresh: boolean, routePath?: string) {
    if (!site) return;
    if (demo) {
      notify.error("Turn off demo data to run an audit.");
      return;
    }
    const auditPath = normalizePagePath(routePath ?? path);
    setPath(auditPath);
    auditCancelled.current = false;
    const request = analyze({
      workspaceId,
      siteId: site.siteId,
      url: pageAddress(domainLabel, auditPath),
      refresh,
    });
    auditRequest.current = request;
    try {
      const res = await request.unwrap();
      selectPage(site.siteId, auditPath, res.report._id);
      notify.success(
        res.cached ? "Showing the most recent audit for this URL" : "Analysis complete"
      );
      if (!res.cached) await refreshUser();
    } catch (e) {
      if (auditCancelled.current) notify.info("Audit cancelled");
      else notifyError(e, "Analysis failed");
    } finally {
      auditRequest.current = null;
    }
  }

  function cancelAudit() {
    auditCancelled.current = true;
    auditRequest.current?.abort();
  }

  function remove(id: string) {
    if (demo) {
      notify.error("Turn off demo data to delete a report.");
      return;
    }
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


  const pageTitle = "SEO";
  const pageDescription = (
    <>
      Audit each page of a tracked site: meta tags, content, technical setup and Lighthouse scores.{" "}
      <SeoHelpLink onHelp={() => setHelpOpen(true)} />
    </>
  );

  if (sitesLoading) {
    return (
      <AppShell>
        <PageHeader title={pageTitle} description={pageDescription} docsPath={DOCS_SLUGS.seo} />
        <SeoInspectSkeleton />
        <SeoTabSkeleton tab={tab} />
      </AppShell>
    );
  }

  if (!sites.length && sitesFailed) {
    return (
      <AppShell>
        <PageHeader title={pageTitle} description={pageDescription} docsPath={DOCS_SLUGS.seo} />
        <SitesLoadError onRetry={() => void refetchSites()} retrying={sitesFetching} />
      </AppShell>
    );
  }

  if (!sites.length) {
    return (
      <AppShell>
        <PageHeader title={pageTitle} description={pageDescription} docsPath={DOCS_SLUGS.seo} />
        <SeoNoSitePanel canEdit={canEdit} />
      </AppShell>
    );
  }


  const showStart = !report && !loading;
  const reportMeta =
    report && data ? (
      <ReportMeta
        report={report}
        data={data}
        viewingOld={Boolean(viewingId && latest && viewingId !== latest._id)}
        onBackToLatest={() => setViewingId(null)}
      />
    ) : null;
  const inspectBar = (hero: boolean) => (
    <SeoInspectBar
      hero={hero}
      sites={sites}
      siteId={siteId}
      onSite={(next) => selectPage(next, "/")}
      canEdit={canEdit}
      domainLabel={domainLabel}
      path={path}
      onPath={setPath}
      onRoute={(next) =>
        seoPages.pages.some((p) => p.path === next && p.audit) ? selectPage(siteId, next) : setPath(next)
      }
      onRun={() => run(false)}
      analyzing={analyzing}
      pages={seoPages.pages}
      footer={hero ? undefined : reportMeta ?? <Skeleton height={10} width={200} radius="sm" />}
    />
  );

  return (
    <AppShell>
      <AuditCrawlView
        workspaceId={workspaceId}
        siteId={siteId}
        url={targetUrl}
        running={analyzing}
        onCancel={cancelAudit}
      />

      <PageHeader
        title={pageTitle}
        description={pageDescription}
        docsPath={DOCS_SLUGS.seo}
        actions={
          report && (
            <Group gap="sm">
              {history.length > 0 && (
                <Button variant="default" leftSection={<History size={15} />} onClick={() => setHistoryOpen(true)}>
                  Audit history
                </Button>
              )}
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
                  variant="default"
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

      {showStart ? (
        <SeoStartPanel
          domain={domainLabel}
          canEdit={canEdit}
          path={path}
          onPath={setPath}
          inspectBar={inspectBar(true)}
        />
      ) : (
        (report || analyzing) && inspectBar(false)
      )}

      <Box mt="xs">
        {(data || loading) && (
          <>
            <div ref={tabsTop} className={layout.anchor} />
            <SeoTabBar active={tab} counts={tabCounts} onChange={setTab} />
          </>
        )}
        {loading && !data && <SeoTabSkeleton tab={tab} />}

        {data && report && (
          <>
            <SeoTabIntro tab={tabDef} onHelp={() => setHelpOpen(true)} onJump={jumpTo} showText={false} />

            <HelpDrawer
              opened={helpOpen}
              onClose={() => setHelpOpen(false)}
              title={t("help.seo.title")}
              sections={getSeoHelp(t)}
              initialId={tabDef.helpId}
            />

            <div className={`seo-report ${layout.report}`} data-stale={switchingPage || undefined} aria-busy={switchingPage}>
              {SEO_TABS.filter((x) => visited.has(x.id)).map((x) => (
                <div
                  key={x.id}
                  id={`seo-panel-${x.id}`}
                  role="tabpanel"
                  aria-labelledby={`seo-tab-${x.id}`}
                  hidden={x.id !== tab}
                >
                  {x.id === "overview" && (
                    <OverviewPanel
                      data={{
                        score: data.score,
                        url: data.finalUrl,
                        performance: data.performance,
                        issues: data.issues,
                        content: data.content,
                        technical: data.technical,
                        siteFiles: data.siteFiles,
                      }}
                      history={pageHistory}
                      onViewIssues={() => setTab("issues")}
                    />
                  )}                  {x.id === "issues" && <IssuesPanel data={data} />}
                  {x.id === "onpage" && (
                    <>
                      <Block id="meta"><MetaPanel meta={data.meta} url={data.finalUrl} /></Block>
                      <Block id="content"><ContentPanel content={data.content} /></Block>
                      <Block id="images"><ImagesPanel content={data.content} /></Block>
                      <Block id="schema"><SchemaPanel schema={data.schema} /></Block>
                    </>
                  )}
                  {x.id === "performance" && (
                    <PerformancePanel
                      performance={data.performance}
                      vitals={<VitalsPanel vitals={fieldVitals} />}
                      suggestions={<SuggestionsPanel performance={data.performance} />}
                    />
                  )}
                  {x.id === "site" && (
                    <>
                      <Block id="technical">
                        <TechnicalPanel technical={data.technical} siteFiles={data.siteFiles} />
                      </Block>
                      <Block id="links"><LinksPanel links={data.links} /></Block>
                      <Block id="crawl">
                        <CrawlPanel report={crawlReport} running={crawling} onCrawl={canEdit ? startCrawl : null} />
                      </Block>
                      <Block id="ai"><AiSearchPanel aiSearch={data.aiSearch} /></Block>
                    </>
                  )}
                </div>
              ))}
            </div>

            <Modal
              opened={historyOpen}
              onClose={() => setHistoryOpen(false)}
              size="xl"
              centered
              title={<Text fw={700} fz={19}>Audit history</Text>}
            >
              <Text size="sm" c="dimmed" mb="md">
                Every audit you run is kept here, so you can confirm a fix moved the score.
              </Text>
              <HistoryPanel
                history={history}
                loading={historyLoading}
                openId={report._id}
                onOpen={(id) => {
                  const row = history.find((h) => h._id === id);
                  selectPage(siteId, row ? normalizePagePath(row.url) : page, id);
                  setHistoryOpen(false);
                  setTab("overview");
                }}
                onDelete={canEdit ? remove : null}
              />
            </Modal>
          </>
        )}
      </Box>
      <Box h="xl" />
    </AppShell>
  );
}
