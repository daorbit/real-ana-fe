import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Text, Group, Button, SimpleGrid,
  Stack, Tabs, Box,
  Alert,
} from "@mantine/core";
import {
  Users, Eye, Radio, FolderKanban, MousePointerClick, Timer,
  Layers, CloudOff,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { StatCard } from "@/shared/ui/StatCard";
import { TrafficTrendCard } from "@/features/analytics/components/trend/TrafficTrendCard";
import { withBaseline, type TrendMetric } from "@/features/analytics/lib/trafficSeries";
import { statComparison } from "@/features/analytics/lib/statComparison";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { WorldMap } from "@/shared/ui/WorldMap";
import { ClicksPanel } from "@/features/analytics/components/ClicksPanel";
import { Heatmap } from "@/shared/ui/Heatmap";
import { ScrollPanel, LandingPanel } from "@/features/analytics/components/EngagementPanels";
import { CustomEventsPanel } from "@/features/analytics/components/CustomEventsPanel";
import { UserFlowPanel } from "@/features/analytics/components/UserFlowPanel";
import { PageHeatmapPanel } from "@/features/analytics/components/heatmap/PageHeatmapPanel";
import { RetentionGrid } from "@/features/analytics/components/RetentionGrid";
import { OutboundPanel, ErrorsPanel } from "@/features/analytics/components/OutboundErrorsPanels";
import { VisitorSplitPanel } from "@/features/analytics/components/VisitorSplitPanel";
import { BarList } from "@/features/analytics/components/BarList";
import { EventsGuideCard } from "@/features/analytics/components/conversion/EventsGuideCard";
import { EventsSummary } from "@/features/analytics/components/conversion/EventsSummary";
import { FilterBar } from "@/features/analytics/components/FilterBar";
import dimClasses from "@/features/analytics/components/layout/ScopeDim.module.css";
import layoutClasses from "@/features/analytics/components/layout/AnalyticsLayout.module.css";
import { RangePicker } from "@/features/analytics/components/RangePicker";
import { ComparePicker } from "@/features/analytics/components/ComparePicker";
import { ExportMenu } from "@/shared/ui/ExportMenu";
import { AnalyticsSkeleton } from "@/features/analytics/components/layout/AnalyticsSkeleton";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { AnalyticsHeader } from "@/features/analytics/components/layout/AnalyticsHeader";
import { setupStateFor } from "@/features/workspace/setupState";
import { SetupScreen } from "@/features/workspace/components/setup/SetupScreen";
import { AnalyticsControlDeck } from "@/features/analytics/components/layout/AnalyticsControlDeck";
import { AnalyticsSubTabs } from "@/features/analytics/components/layout/AnalyticsSubTabs";
import { getAnalyticsSections } from "@/features/analytics/components/layout/analyticsSections";
import { getAnalyticsHelp } from "@/features/analytics/components/analyticsHelp";
import { useStats, useSiteScope, useLive } from "@/features/analytics";
import { useAnalyticsUrlState } from "@/features/analytics/hooks/useAnalyticsUrlState";
import { LiveNowCard } from "@/features/analytics/components/liveAudience/LiveNowCard";
import { LiveStatFooter } from "@/features/analytics/components/liveAudience/LiveStatFooter";
import { useSites } from "@/features/workspace";
import {
  useGetSegmentsQuery, useSaveSegmentMutation,
  useUpdateSegmentMutation, useDeleteSegmentMutation,
  useGetMarkersQuery, useSaveMarkerMutation, useDeleteMarkerMutation,
  useGetStatsCompareQuery, useExplainMetricMutation,
} from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { MarkerDialog } from "@/features/analytics/components/MarkerLayer";
import { notify, errMessage } from "@/shared/lib/notify";
import { countryLabel, duration } from "@/shared/lib";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { useWorkspace, useActiveBilling, usePermissions } from "@/features/workspace/context";
import type {
   StatsFilter, Segment, Marker, MarkerKind,
} from "@/shared/types";
import { serializeFilter } from "@/shared/types";
import { useTitle } from "@/shared/lib/useTitle";
import { useUndoableRemoval } from "@/shared/hooks/useUndoableRemoval";

const NO_SEGMENTS: Segment[] = [];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={layoutClasses.sectionTitle}>{children}</h2>;
}

export default function Analytics() {
  useTitle("Analytics");
  const { t } = useTranslation();
  const billing = useActiveBilling();
  const { active, loading } = useWorkspace();
  const { canEdit } = usePermissions();
  const {
    rangeState, setRangeState, compareState, setCompareState,
    filter, setFilter, section, tab, setView, setTab,
  } = useAnalyticsUrlState(billing?.allowedRanges);
  const navigate = useNavigate();
  useEffect(() => {
    if (tab === "funnel") navigate("/app/funnels", { replace: true });
  }, [tab, navigate]);
  const range = rangeState.preset;
  // Demo sessions never hit the network, so the per-panel comparison — which
  // has no fixture behind it — stays off there.
  const { demo } = useDemo();
  const [helpOpen, setHelpOpen] = useState(false);
  const [chartFocus, setChartFocus] = useState<TrendMetric>("visitors");

  const [pickedSites] = useSiteScope(active?._id);

  const { sites, lastUpdated: sitesLoadedAt, refresh: refreshSites } = useSites(active?._id);
  const setup = setupStateFor(sites, Boolean(sitesLoadedAt));

  const siteScope = useMemo(() => {
    if (!pickedSites.length) return [];
    const owned = new Set(sites.map((s) => s.siteId));
    return pickedSites.filter((id) => owned.has(id));
  }, [pickedSites, sites]);


  const { stats, switching, failed, refresh, refreshing, lastUpdated } =
    useStats(
      active?._id,
      range,
      serializeFilter(filter),
      siteScope,
      rangeState.from,
      rangeState.to,
      compareState.mode,
      compareState.from,
    );
  const { audience: liveAudience } = useLive(active?._id, serializeFilter(filter), siteScope);

  const addFilter = (key: keyof StatsFilter, value: string) => {
    setFilter((f) => ({ ...f, [key]: value }));
  };
  const removeFilter = (key: keyof StatsFilter) =>
    setFilter((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
  const clearFilter = () => setFilter({});

  const markerWindow = useMemo(() => {
    if (rangeState.preset === "custom" && rangeState.from && rangeState.to)
      return { from: rangeState.from, to: rangeState.to };

    const spans: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    const span = spans[rangeState.preset] ?? spans["24h"];
    return {
      from: new Date(Date.now() - span).toISOString(),
      to: new Date().toISOString(),
    };
  }, [rangeState.preset, rangeState.from, rangeState.to]);

  const { data: markerData, originalArgs: markerArgs } = useGetMarkersQuery(
    { wid: active?._id ?? "", from: markerWindow.from, to: markerWindow.to },
    { skip: !active?._id },
  );
  // Held across range changes (so the timeline doesn't flicker) but dropped on
  // a workspace switch, where they would be another tenant's annotations.
  const removal = useUndoableRemoval();
  const markers = useMemo(
    () => ((markerArgs?.wid === active?._id ? markerData : undefined) ?? []).filter((m) => !removal.hidden.has(m.id)),
    [markerArgs?.wid, active?._id, markerData, removal.hidden],
  );

  const [markersOpen, setMarkersOpen] = useState(false);
  const [saveMarker, { isLoading: savingMarker }] = useSaveMarkerMutation();
  const [deleteMarker] = useDeleteMarkerMutation();

  const handleSaveMarker = async (input: {
    label: string;
    description: string;
    kind: MarkerKind;
    at: string;
  }) => {
    if (!active?._id) return;
    try {
      await saveMarker({ wid: active._id, ...input }).unwrap();
      notify.success(`Marked "${input.label}"`);
    } catch (e) {
      notify.error(errMessage(e, "Could not add that marker."));
    }
  };

  const handleDeleteMarker = (marker: Marker) => {
    const wid = active?._id;
    if (!wid) return;
    removal.remove({
      ids: [marker.id],
      message: `Deleted "${marker.label}"`,
      commit: () => deleteMarker({ wid, id: marker.id }).unwrap(),
      errorMessage: "Could not delete that marker.",
    });
  };

  // Saved segments for this workspace. Skipped until a workspace is known —
  // the endpoint is workspace-scoped and there is nothing to ask for yet.
  const { currentData: savedSegments = NO_SEGMENTS } = useGetSegmentsQuery(active?._id ?? "", {
    skip: !active?._id,
  });
  const segments = useMemo(
    () => savedSegments.filter((s) => !removal.hidden.has(s.id)),
    [savedSegments, removal.hidden],
  );
  const [saveSegment, { isLoading: savingSegment }] = useSaveSegmentMutation();
  const [updateSegment] = useUpdateSegmentMutation();
  const [deleteSegment] = useDeleteSegmentMutation();

  // Which segment row is mid-request. RTK Query's own `isLoading` is per hook,
  // not per row, so it can't say which of several segments is being changed.
  const [busySegment, setBusySegment] = useState<string | null>(null);

  const handleSaveSegment = async (name: string, f: StatsFilter) => {
    if (!active?._id) return;
    try {
      await saveSegment({ wid: active._id, name, filter: f }).unwrap();
      notify.success(`Saved "${name}"`);
    } catch (e) {
      notify.error(errMessage(e, "Could not save that segment."));
    }
  };

  const handleDeleteSegment = (segment: Segment) => {
    const wid = active?._id;
    if (!wid) return;
    removal.remove({
      ids: [segment.id],
      message: `Deleted "${segment.name}"`,
      commit: () => deleteSegment({ wid, id: segment.id }).unwrap(),
      errorMessage: "Could not delete that segment.",
    });
  };

  const handleTogglePin = async (segment: Segment) => {
    if (!active?._id) return;
    setBusySegment(segment.id);
    try {
      await updateSegment({
        wid: active._id,
        id: segment.id,
        pinned: !segment.pinned,
      }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not update that segment."));
    } finally {
      setBusySegment(null);
    }
  };

  const shown = useRef(stats);
  if (stats) shown.current = stats;
  const view = stats ?? shown.current;


  const series = useMemo(
    () => withBaseline(view?.timeseries, view?.comparison?.timeseries),
    [view?.timeseries, view?.comparison?.timeseries],
  );


  const explainSiteId =
    siteScope.length === 1 ? siteScope[0] : sites.length === 1 ? sites[0].siteId : null;

  const [explainMetric] = useExplainMetricMutation();
  const [explainState, setExplainState] = useState<
    Record<string, { text?: string; error?: string }>
  >({});
  // Which card's request is in flight — a shared mutation-loading flag would
  // light up every sparkle icon at once, not just the one that was clicked.
  const [explainPendingKey, setExplainPendingKey] = useState<string | null>(null);

  const explainKey = `${range}:${rangeState.from ?? ""}:${rangeState.to ?? ""}:${compareState.mode}`;

  const onExplainMetric = useCallback(
    async (metric: string) => {
      if (!active?._id || !explainSiteId) return;
      const key = `${metric}:${explainKey}`;
      if (explainState[key] || explainPendingKey === key) return;

      setExplainPendingKey(key);
      try {
        const { reply } = await explainMetric({
          workspaceId: active._id,
          siteId: explainSiteId,
          metric,
          range,
          from: rangeState.from,
          to: rangeState.to,
          compare: compareState.mode,
          compareFrom: compareState.from,
        }).unwrap();
        setExplainState((prev) => ({ ...prev, [key]: { text: reply } }));
      } catch (e) {
        setExplainState((prev) => ({
          ...prev,
          [key]: { error: errMessage(e, "Could not explain this right now.") },
        }));
      } finally {
        setExplainPendingKey((cur) => (cur === key ? null : cur));
      }
    },
    [active?._id, explainSiteId, explainKey, explainState, explainPendingKey, explainMetric, range, rangeState, compareState],
  );

  // Skeleton only on a true first load, when there is nothing to show at all.
  if (active && !view && failed) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load analytics"
          description="We couldn't reach your analytics just now. Your data is safe — check your connection and try again."
          onRetry={() => void refresh()}
          retrying={refreshing}
        />
      </AppShell>
    );
  }

  if (loading || (active && !view)) {
    return <AppShell><AnalyticsSkeleton /></AppShell>;
  }

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderKanban}
          title="No workspace selected"
          description="Analytics reports on the sites inside a workspace. Pick one — or create your first — and the numbers land here."
          action={{ label: "Go to Workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  if (setup) {
    return (
      <AppShell>
        <SetupScreen state={setup} workspaceId={active._id} onVerified={() => void refreshSites()} />
      </AppShell>
    );
  }

  const siteCount = view?.siteCount ?? 0;
  // Impressions and scroll depth cannot exist for a site on an older script, so
  // their empty states should say that rather than "waiting for data".
  const anyOutdated = (view?.outdatedSites?.length ?? 0) > 0;
  const d = view?.deltas;
  const hasData = (view?.pageviews ?? 0) > 0;

  const comparing = Boolean(view?.comparison?.timeseries?.length);

 
  const useBreakdownCompare = (dimension: string, enabled: boolean) => {
    const { data, isFetching } = useGetStatsCompareQuery(
      {
        workspaceId: active?._id ?? "",
        dimension,
        range,
        filter: serializeFilter(filter),
        sites: siteScope,
        from: rangeState.from,
        to: rangeState.to,
        compare: compareState.mode,
        compareFrom: compareState.from,
      },
      { skip: !enabled || !active?._id || demo },
    );
    return { rows: data?.rows, loading: isFetching };
  };

  // Stat `label`s are translated; the long `hint` tooltips stay English for a
  // later pass — they fall back cleanly and aren't blocking to read.
  const audience = [
    { metric: "visitors", icon: Users, label: t("analytics.stat.visitors"), value: view?.visitors ?? 0, color: "blue", delta: d?.visitors ?? null, comparison: statComparison(view, "visitors", range), spark: series, sparkKey: "visitors", syncId: "analytics-overview",
      hint: "Distinct people in this period. A visitor is a privacy-friendly daily hash of IP and browser — no cookies, so the same person on two days counts twice." },
    { metric: "pageviews", icon: Eye, label: t("analytics.stat.pageviews"), value: view?.pageviews ?? 0, color: "orange", delta: d?.pageviews ?? null, comparison: statComparison(view, "pageviews", range), spark: series, syncId: "analytics-overview", sparkKey: "views",
      hint: "Every page load, including SPA route changes. One visitor can rack up many pageviews." },
    { metric: "sessions", icon: Layers, label: t("analytics.stat.sessions"), value: view?.sessions ?? 0, color: "purple", delta: d?.sessions ?? null, comparison: statComparison(view, "sessions", range), spark: series, sparkKey: "sessions", syncId: "analytics-overview",
      hint: "A visit — one or more pageviews with no 30-minute gap. A returning visitor later in the day starts a fresh session." },
    { metric: null, icon: Radio, label: t("analytics.stat.live"), value: liveAudience ? liveAudience.humans : view?.live ?? 0, color: "green", live: true,
      note: "people on your sites right now", footer: <LiveStatFooter audience={liveAudience} />,
      hint: liveAudience
        ? `Real people active in the last 5 minutes. ${liveAudience.bots + liveAudience.suspect} bots, AI agents and suspicious visitors are left out.`
        : "Distinct visitors active in the last 5 minutes, updated as the page refreshes." },
  ] as const;

  const percent = (v: number) => `${v}%`;
  const engagement = [
    { metric: "bounceRate", icon: MousePointerClick, label: t("analytics.stat.bounce"), value: `${view?.bounceRate ?? 0}%`, color: "rose", delta: d?.bounceRate ?? null, inverseDelta: true, comparison: statComparison(view, "bounceRate", range), spark: series, sparkKey: "bounceRate", sparkFormat: percent,
      hint: "Share of sessions that left after a single pageview without interacting. Lower is usually better." },
    { metric: "avgSessionMs", icon: Timer, label: t("analytics.stat.avgSession"), value: duration(view?.avgSessionMs ?? 0), color: "teal", delta: d?.avgSessionMs ?? null, comparison: statComparison(view, "avgSessionMs", range), spark: series, sparkKey: "avgSessionMs", sparkFormat: duration,
      hint: "Average visible time across a whole visit. A backgrounded tab doesn't count, so this is real attention time." },
    { metric: "avgTimeOnPageMs", icon: Timer, label: t("analytics.stat.avgTimeOnPage"), value: duration(view?.avgTimeOnPageMs ?? 0), color: "indigo", spark: series, sparkKey: "avgTimeOnPageMs", sparkFormat: duration,
      hint: "Average visible time on a single page before moving on." },
    { metric: "pagesPerSession", icon: Layers, label: t("analytics.stat.pagesPerSession"), value: view?.pagesPerSession ?? 0, color: "yellow", delta: d?.pagesPerSession ?? null, comparison: statComparison(view, "pagesPerSession", range), spark: series, sparkKey: "pagesPerSession",
      hint: "How many pages a typical visit touches. Higher means people explore more." },
  ] as const;

  const SECTIONS = getAnalyticsSections(t);
  const hasChips = Object.values(filter).some(Boolean) || segments.length > 0;
  const updating = switching;

  const activeSection = SECTIONS.find((s) => s.value === section) ?? SECTIONS[0];

  // Switch section: jump to its first detail tab so a panel is always showing.
  const goSection = (value: string) => {
    const s = SECTIONS.find((x) => x.value === value);
    setView(value, s && s.tabs.length ? s.tabs[0].value : undefined);
  };

  const liveNow = liveAudience ? liveAudience.humans : view?.live ?? 0;
  const autoCompare = Boolean(view?.comparison) && !demo;
  const scopedSites = siteScope.length ? sites.filter((s) => siteScope.includes(s.siteId)) : sites;
  const heatmapHost = scopedSites.length === 1 ? scopedSites[0].domain : undefined;
  const baselineLabel =
    view?.comparison?.mode === "yoy"
      ? "Same period last year"
      : view?.comparison?.mode === "custom"
        ? "Custom baseline"
        : "Previous period";

  return (
    <AppShell>
      <div className="an-report">
      <HelpDrawer
        opened={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={t("analytics.help")}
        sections={getAnalyticsHelp(t)}
      />

      <MarkerDialog
        opened={markersOpen}
        onClose={() => setMarkersOpen(false)}
        markers={markers}
        onSave={canEdit ? handleSaveMarker : null}
        onDelete={canEdit ? handleDeleteMarker : null}
        saving={savingMarker}
      />

      <AnalyticsHeader
        subtitle={
          <>
            Aggregated across {siteCount} site{siteCount === 1 ? "" : "s"} in <b>{active.name}</b>.
            {view?.comparison?.mode === "yoy"
              ? " Changes compare to the same period last year."
              : view?.comparison?.mode === "custom"
                ? ` Changes compare to the ${range} from ${dayjs(view.comparison.since).format("MMM D, YYYY")}.`
                : ` Changes compare to the previous ${range}.`}
          </>
        }
        onRefresh={refresh}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onHelp={() => setHelpOpen(true)}
        exportMenu={
          <ExportMenu
            workspaceId={active?._id}
            range={range}
            from={rangeState.from}
            to={rangeState.to}
            filter={serializeFilter(filter)}
            sites={siteScope}
          />
        }
      />

      <AnalyticsControlDeck
        controls={
          <>
            <RangePicker value={rangeState} onChange={setRangeState} disabled={updating} />
            <ComparePicker value={compareState} onChange={setCompareState} disabled={updating} />
          </>
        }
        updating={updating}
        chips={
          hasChips ? (
            <FilterBar
              mb={0}
              filter={filter}
              onRemove={removeFilter}
              onClear={clearFilter}
              segments={segments}
              onApplySegment={(s) => setFilter(s.filter)}
              onSaveSegment={canEdit ? handleSaveSegment : undefined}
              onDeleteSegment={canEdit ? handleDeleteSegment : undefined}
              onTogglePin={canEdit ? handleTogglePin : undefined}
              saving={savingSegment}
              busyId={busySegment}
            />
          ) : null
        }
        sections={SECTIONS}
        active={section}
        onSection={goSection}
        status={
          <>
            <span className="status-dot live" aria-hidden />
            {liveNow} on your sites now
          </>
        }
      />

      {/* The previous range stays on screen, dimmed, until the new one lands —
          so the numbers visibly go stale rather than the page going blank. */}
      {failed && (
        <Alert
          color="red"
          variant="light"
          icon={<CloudOff size={16} />}
          mb="md"
          title="Couldn't load this view"
        >
          <Group justify="space-between" gap="sm" wrap="wrap">
            <Text size="sm">You're seeing the last numbers we loaded. They may be out of date.</Text>
            <Button size="xs" variant="default" loading={refreshing} onClick={() => void refresh()}>
              Try again
            </Button>
          </Group>
        </Alert>
      )}

      <Box className={dimClasses.dim} data-switching={switching || undefined}>

      {section === "overview" && <>
      <SectionTitle>{t("analytics.sectionAudience")}</SectionTitle>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" className={layoutClasses.band}>
        {audience.map((k, i) => {
          const { metric, ...card } = k;
          const key = metric ? `${metric}:${explainKey}` : "";
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
              <StatCard
                {...card}
                onExplain={metric && explainSiteId ? () => onExplainMetric(metric) : undefined}
                explaining={metric ? explainPendingKey === key : false}
                explanation={metric ? explainState[key]?.text ?? null : null}
                explainError={metric ? explainState[key]?.error ?? null : null}
              />
            </motion.div>
          );
        })}
      </SimpleGrid>

      <SectionTitle>{t("analytics.sectionEngagement")}</SectionTitle>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" className={layoutClasses.band}>
        {engagement.map((k, i) => {
          const { metric, ...card } = k;
          const key = metric ? `${metric}:${explainKey}` : "";
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}>
              <StatCard
                {...card}
                onExplain={metric && explainSiteId ? () => onExplainMetric(metric) : undefined}
                explaining={metric ? explainPendingKey === key : false}
                explanation={metric ? explainState[key]?.text ?? null : null}
                explainError={metric ? explainState[key]?.error ?? null : null}
              />
            </motion.div>
          );
        })}
      </SimpleGrid>

      <SectionTitle>{t("analytics.sectionTraffic")}</SectionTitle>
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" className={layoutClasses.band}>
        <div className="grid-span-2">
          <TrafficTrendCard
            series={series}
            hasData={hasData}
            comparing={comparing}
            baselineLabel={baselineLabel}
            metric={chartFocus}
            onMetric={setChartFocus}
            markers={markers}
            hourly={range === "1h" || range === "24h"}
            onOpenMarkers={() => setMarkersOpen(true)}
          />
        </div>
        <LiveNowCard
          pages={view?.livePages ?? []}
          total={view?.live ?? 0}
          audience={liveAudience}
          onSelectPath={(p) => addFilter("path", p)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <BarList
          title={t("analytics.list.topPages")}
          subtitle="Most viewed in this period"
          items={view?.topPages ?? []}
          limit={5}
          columns={{ label: "Page", value: "Views" }}
          filterKey="path"
          onFilter={addFilter}
          dimension="path"
          useCompare={useBreakdownCompare}
          autoCompare={autoCompare}
          link={{ label: "All pages", onClick: () => goSection("behavior") }}
        />
        <BarList
          title="Top sources"
          subtitle="Where visitors came from"
          items={view?.topReferrers ?? []}
          limit={5}
          columns={{ label: "Source", value: "Visitors" }}
          filterKey="referrer"
          onFilter={addFilter}
          dimension="referrer"
          useCompare={useBreakdownCompare}
          autoCompare={autoCompare}
          link={{ label: "All sources", onClick: () => goSection("acquisition") }}
        />
      </SimpleGrid>
      </>}

      {section !== "overview" && <>
      <AnalyticsSubTabs label={activeSection.label} tabs={activeSection.tabs} active={tab} onChange={setTab} />

      <Tabs value={tab} onChange={(v) => v && setTab(v)} variant="pills" color="emerald" keepMounted={false}>

        <Tabs.Panel value="pages">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
            <BarList title={t("analytics.list.topPages")} subtitle="Pages with the most views" items={view?.topPages ?? []}
                     columns={{ label: "Page", value: "Views" }} filterKey="path" onFilter={addFilter}
                     dimension="path" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.entryPages")} subtitle="Where sessions start" items={view?.entryPages ?? []}
                     columns={{ label: "Page", value: "Sessions" }}
                     empty="No sessions recorded yet" filterKey="path" onFilter={addFilter}
                     dimension="entryPath" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.exitPages")} subtitle="Where sessions end" items={view?.exitPages ?? []}
                     columns={{ label: "Page", value: "Exits" }}
                     empty="No completed sessions yet" filterKey="path" onFilter={addFilter}
                     dimension="exitPath" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="engagement">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
            <ScrollPanel items={view?.scrollDepth ?? []} outdated={anyOutdated} onSelectPath={(p) => addFilter("path", p)} />
            <LandingPanel items={view?.landingPages ?? []} onSelectPath={(p) => addFilter("path", p)} />
          </SimpleGrid>
          <Heatmap cells={view?.heatmap ?? []} />
        </Tabs.Panel>

        <Tabs.Panel value="sources">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
            <BarList title={t("analytics.list.channels")} subtitle="How visitors found you" chart="donut" items={view?.channels ?? []}
                     empty="No traffic yet" />
            <BarList title={t("analytics.list.referrers")} subtitle="Sites that sent visitors" items={view?.topReferrers ?? []}
                     columns={{ label: "Source", value: "Visitors" }} filterKey="referrer" onFilter={addFilter}
                     dimension="referrer" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
            <VisitorSplitPanel split={view?.visitorSplit} />
            <BarList title={t("analytics.list.utmSources")} subtitle="utm_source" items={view?.utmSources ?? []}
                     columns={{ label: "Source", value: "Visitors" }} filterKey="utmSource" onFilter={addFilter}
                     dimension="utmSource" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.utmCampaigns")} subtitle="utm_campaign" items={view?.utmCampaigns ?? []}
                     columns={{ label: "Campaign", value: "Visitors" }} filterKey="utmCampaign" onFilter={addFilter}
                     dimension="utmCampaign" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="tech">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <BarList title={t("analytics.list.browsers")} subtitle="Share of visitors" chart="donut" items={view?.browsers ?? []}
                     filterKey="browser" onFilter={addFilter}
                     dimension="browser" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.operatingSystems")} subtitle="Share of visitors" chart="donut" items={view?.operatingSystems ?? []}
                     filterKey="os" onFilter={addFilter}
                     dimension="os" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.devices")} subtitle="Share of visitors" chart="donut" items={view?.devices ?? []}
                     filterKey="device" onFilter={addFilter}
                     dimension="device" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            <BarList title={t("analytics.list.screenSizes")} subtitle="Most common viewports" chart="donut" items={view?.screenSizes ?? []} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="geo">
          <Stack gap="md">
            <WorldMap countries={view?.countries ?? []} onSelect={(code) => addFilter("country", code)} />
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <BarList
                title={t("analytics.list.countries")}
                subtitle="Visitors by country"
                items={view?.countries ?? []}
                columns={{ label: "Country", value: "Visitors" }}
                dimension="country"
                useCompare={useBreakdownCompare}
                autoCompare={autoCompare}
                filterKey="country"
                onFilter={addFilter}
                format={(k) => (
                  <span>
                    <span style={{ marginRight: 8, display: "inline-flex", verticalAlign: "middle" }}><CountryFlag code={k} size={14} /></span>
                    {countryLabel(k)}
                  </span>
                )}
              />
              <BarList title={t("analytics.list.languages")} subtitle="Browser language" items={view?.languages ?? []}
                       columns={{ label: "Language", value: "Visitors" }} filterKey="language" onFilter={addFilter}
                       dimension="language" useCompare={useBreakdownCompare} autoCompare={autoCompare} />
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="clicks">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
            <div className="grid-span-2">
              <ClicksPanel clicks={view?.clicks ?? []} total={view?.clickCount ?? 0} limit={15} />
            </div>
            <OutboundPanel items={view?.outboundClicks ?? []} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="heatmaps">
          <PageHeatmapPanel
            workspaceId={active._id}
            range={range}
            from={rangeState.from}
            to={rangeState.to}
            sites={siteScope}
            clicks={view?.clicks}
            host={heatmapHost}
          />
        </Tabs.Panel>

        <Tabs.Panel value="events">
          {(view?.customEvents?.length ?? 0) > 0 && (
            <EventsSummary items={view?.customEvents ?? []} totalRevenue={view?.totalRevenue ?? 0} />
          )}
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
            <div className="grid-span-2">
              <CustomEventsPanel
                items={view?.customEvents ?? []}
                onSelect={(key) => addFilter("eventName", key)}
              />
            </div>
            <EventsGuideCard />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="flow">
          <UserFlowPanel workspaceId={active._id} range={range} sites={siteScope} onSelectPath={(p) => addFilter("path", p)} />
        </Tabs.Panel>


        <Tabs.Panel value="retention">
          <RetentionGrid workspaceId={active._id} sites={siteScope} />
        </Tabs.Panel>

        <Tabs.Panel value="errors">
          <ErrorsPanel items={view?.errors ?? []} onSelectPath={(p) => addFilter("path", p)} />
        </Tabs.Panel>
      </Tabs>
      </>}
      </Box>
      </div>
    </AppShell>
  );
}
