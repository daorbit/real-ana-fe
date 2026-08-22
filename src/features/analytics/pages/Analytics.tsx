import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Title, Text, Group, Button, SimpleGrid, Card, Progress,
  Stack, Center, ThemeIcon, Badge, Tabs, Box, Loader, UnstyledButton,
  ActionIcon, Tooltip as MTooltip,
} from "@mantine/core";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users, Eye, Radio, FolderKanban, Inbox, MousePointerClick, Timer,
  Layers, LogIn, LogOut, AppWindow, MonitorSmartphone, Globe2, Languages, Tag,
  ArrowDownWideNarrow, Zap, Filter, GitBranch, Repeat,
  Split, Target, AlertTriangle, LayoutDashboard, HelpCircle, GitCompareArrows,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PlanGate } from "@/features/billing/components/PlanGate";
import { AnalyticsArt } from "@/shared/ui/Brand";
import { StatCard } from "@/shared/ui/StatCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { WorldMap } from "@/shared/ui/WorldMap";
import { ClicksPanel } from "@/features/analytics/components/ClicksPanel";
import { Heatmap } from "@/shared/ui/Heatmap";
import { ScrollPanel, LandingPanel } from "@/features/analytics/components/EngagementPanels";
import { CustomEventsPanel } from "@/features/analytics/components/CustomEventsPanel";
import { FunnelBuilder } from "@/features/analytics/components/FunnelBuilder";
import { RetentionGrid } from "@/features/analytics/components/RetentionGrid";
import { GoalsPanel } from "@/features/analytics/components/GoalsPanel";
import { OutboundPanel, ErrorsPanel } from "@/features/analytics/components/OutboundErrorsPanels";
import { VisitorSplitPanel } from "@/features/analytics/components/VisitorSplitPanel";
import { FilterBar } from "@/features/analytics/components/FilterBar";
import { RefreshButton } from "@/shared/ui/Refresh";
import { SiteFilter } from "@/features/analytics/components/SiteFilter";
import { SwitchOverlay, useSwitchOverlay } from "@/shared/ui/SwitchOverlay";
import { RangePicker, type RangeState } from "@/features/analytics/components/RangePicker";
import { ComparePicker, type CompareState } from "@/features/analytics/components/ComparePicker";
import { ExportMenu } from "@/shared/ui/ExportMenu";
import { AnalyticsSkeleton } from "@/shared/ui/Skeletons";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { getAnalyticsHelp } from "@/features/analytics/components/analyticsHelp";
import { useStats } from "@/features/analytics";
import { useSites } from "@/features/workspace";
import {
  useGetSegmentsQuery, useSaveSegmentMutation,
  useUpdateSegmentMutation, useDeleteSegmentMutation,
  useGetMarkersQuery, useSaveMarkerMutation, useDeleteMarkerMutation,
  useGetStatsCompareQuery,
} from "@/app/store";
import { useDemo } from "@/features/demo/context";
import {
  markerLines, MarkerLegend, MarkerDialog, MarkerButton,
} from "@/features/analytics/components/MarkerLayer";
import { notify, errMessage } from "@/shared/lib/notify";
import { countryFlag, countryLabel, duration, share, num } from "@/shared/lib";
import { useWorkspace, useActiveBilling, usePermissions } from "@/features/workspace/context";
import type {
  Stats, Bucket, StatsFilter, Segment, Marker, MarkerKind, BreakdownComparisonRow,
} from "@/shared/types";
import { serializeFilter } from "@/shared/types";

const CHART = "var(--accent)";

/** Small uppercase heading that groups a band of cards under one label. */
function SectionLabel({
  icon: Icon,
  children,
  noMargin,
}: {
  icon: any;
  children: React.ReactNode;
  noMargin?: boolean;
}) {
  return (
    <Group gap={7} mb={noMargin ? 0 : "sm"}>
      <Icon size={14} className="sect-ic" />
      <Text fw={700} size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
        {children}
      </Text>
    </Group>
  );
}

/** A coloured dot + label, for the traffic chart's inline legend. */
function LegendDot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <Group gap={6} wrap="nowrap">
      <span style={{ width: 9, height: 9, borderRadius: 3, background: color, display: "inline-block" }} />
      <Text size="xs" c="dimmed">{children}</Text>
    </Group>
  );
}

/**
 * One breakdown row's movement against the baseline.
 *
 * Shows the previous count alongside the percentage, because a percentage
 * without its base is unreadable at this scale — "+300%" on a row that went
 * from 1 to 4 is noise, and the reader can only tell by seeing the 1.
 */
function BreakdownDelta({ row }: { row?: BreakdownComparisonRow }) {
  if (!row) return null;
  const { delta: pct, previous } = row;

  // A row with no baseline is new, not up-by-infinity.
  if (previous === 0) {
    return <Text size="xs" c="emerald" fw={600}>new</Text>;
  }
  if (pct === null) return <Text size="xs" c="dimmed">—</Text>;

  const up = pct > 0;
  const flat = pct === 0;
  return (
    <MTooltip label={`${num(previous)} in the baseline period`} withArrow>
      <Text size="xs" fw={600} c={flat ? "dimmed" : up ? "emerald" : "red"}>
        {flat ? "±0%" : `${up ? "+" : ""}${pct}%`}
      </Text>
    </MTooltip>
  );
}

/**
 * Stand-in for the comparison hook on cards that were not given one.
 *
 * Module-level so it is the same function object on every render: a card either
 * always has a real `useCompare` or always has this one, and the hook call
 * inside `BarList` stays a single unconditional call either way. Calls no hooks
 * itself, so substituting it adds nothing to the order.
 */
const NO_COMPARE = () => ({ rows: undefined, loading: false });

function BarList({
  title,
  items,
  color = "teal",
  icon: Icon,
  format,
  empty,
  filterKey,
  onFilter,
  fill = true,
  dimension,
  useCompare,
}: {
  title: string;
  items: Bucket[];
  color?: string;
  icon?: any;
  format?: (key: string) => React.ReactNode;
  empty?: string;
  /** When set, each row filters the dashboard by this dimension on click. */
  filterKey?: keyof StatsFilter;
  onFilter?: (key: keyof StatsFilter, value: string) => void;
  /**
   * Stretch to the height of the grid row. Correct inside a SimpleGrid, wrong
   * inside a `.masonry` column — there is no row there to fill, so a card asked
   * to be 100% tall collapses instead.
   */
  fill?: boolean;
  /**
   * The dimension name this list breaks down by, as the compare endpoint knows
   * it. Supplying it puts a compare toggle on the card; omitting it leaves the
   * card exactly as it was.
   */
  dimension?: string;
  /** Fetches this dimension's rows across both periods, when the toggle is on. */
  useCompare?: (dimension: string, enabled: boolean) => {
    rows: BreakdownComparisonRow[] | undefined;
    loading: boolean;
  };
}) {
  const { t } = useTranslation();
  const emptyText = empty ?? t("analytics.waitingForData");
  const clickable = Boolean(filterKey && onFilter);

  // Off by default and per card: the comparison costs a request, and a user
  // reading "top pages" usually wants the ranking, not the movement.
  const [compareOn, setCompareOn] = useState(false);
  const canCompare = Boolean(dimension && useCompare);
  // `useCompare` is a hook, so it has to be called unconditionally and in the
  // same order every render. Cards that were given one always have one; cards
  // that weren't get this no-op, which calls nothing and always reports idle.
  const compareHook = useCompare ?? NO_COMPARE;
  const { rows: compareRows, loading: compareLoading } = compareHook(
    dimension ?? "",
    compareOn && canCompare,
  );

  // While the comparison loads, the plain ranking stays on screen rather than
  // blanking the card — same reasoning as the page-level stale payload.
  const showCompare = compareOn && canCompare && !!compareRows;
  const shown: Bucket[] = showCompare
    ? compareRows.map((r) => ({ key: r.key, count: r.count }))
    : items;

  const deltaByKey = new Map(compareRows?.map((r) => [r.key, r]) ?? []);
  const total = shown.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...shown.map((i) => i.count));

  return (
    <Card withBorder radius="lg" padding="lg" h={fill ? "100%" : undefined}>
      <Group gap={8} mb="md" justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          {Icon && <Icon size={15} className="sect-ic" />}
          <Text fw={600} c="dimmed" size="sm" truncate>{title}</Text>
        </Group>
        {canCompare && (
          <MTooltip label="Compare to the baseline period" withArrow>
            <ActionIcon
              variant={compareOn ? "filled" : "subtle"}
              color={compareOn ? "emerald" : "gray"}
              size="sm"
              loading={compareLoading}
              onClick={() => setCompareOn((v) => !v)}
              aria-label="Compare to the baseline period"
            >
              <GitCompareArrows size={14} />
            </ActionIcon>
          </MTooltip>
        )}
      </Group>

      {shown.length === 0 ? (
        <Center py="lg" mih={120}>
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">{emptyText}</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {shown.map((i) => (
            <div
              key={i.key}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onFilter!(filterKey!, i.key) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onFilter!(filterKey!, i.key);
                      }
                    }
                  : undefined
              }
              className={clickable ? "bar-row" : undefined}
              title={clickable ? `Filter by ${i.key}` : undefined}
            >
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Text size="sm" truncate style={{ flex: 1 }}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Group gap={6} wrap="nowrap">
                  {clickable && (
                    <span className="bar-row-filter">
                      <Filter size={12} />
                      Filter
                    </span>
                  )}
                  {showCompare ? (
                    <BreakdownDelta row={deltaByKey.get(i.key)} />
                  ) : (
                    <Text size="xs" c="dimmed">{share(i.count, total)}</Text>
                  )}
                  <Text size="sm" fw={700}>{num(i.count)}</Text>
                </Group>
              </Group>
              <Progress value={(i.count / max) * 100} size="sm" radius="xl" color={color} />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Card withBorder shadow="md" padding="xs" radius="md">
      <Text size="xs" c="dimmed" mb={2}>{label}</Text>
      {payload.map((p: any) => (
        <Text key={p.dataKey} size="sm" fw={700}>
          {p.value.toLocaleString()} {p.dataKey === "views" ? "views" : "visitors"}
        </Text>
      ))}
    </Card>
  );
}

/** Who is on the site right now. */
function LiveNow({ stats }: { stats: Stats | null }) {
  const { t } = useTranslation();
  const pages = stats?.livePages ?? [];
  const live = stats?.live ?? 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className="status-dot live" style={{ background: "var(--mantine-color-teal-6)" }} />
          <Text fw={600} c="dimmed" size="sm">{t("analytics.rightNow")}</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">
          {live} visitor{live === 1 ? "" : "s"}
        </Badge>
      </Group>

      {pages.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed" size="xs">{t("analytics.nobodyOnSite")}</Text>
        </Center>
      ) : (
        <Stack gap="xs">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
            Active pages
          </Text>
          {pages.map((p) => (
            <Group key={p.key} justify="space-between" gap="xs" wrap="nowrap">
              <Text size="sm" truncate style={{ flex: 1 }}>{p.key}</Text>
              <Badge variant="light" color="gray" size="sm">{p.count}</Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}

export default function Analytics() {
  const { t } = useTranslation();
  // Funnels are entitled per workspace, so this follows the active one.
  const billing = useActiveBilling();
  const funnelLocked = (billing?.plan?.slug ?? "free") === "free";
  const { active, loading } = useWorkspace();
  const { canEdit } = usePermissions();
  const [rangeState, setRangeState] = useState<RangeState>({ preset: "24h" });
  const range = rangeState.preset;
  const [compareState, setCompareState] = useState<CompareState>({ mode: "previous" });
  // Demo sessions never hit the network, so the per-panel comparison — which
  // has no fixture behind it — stays off there.
  const { demo } = useDemo();
  const [filter, setFilter] = useState<StatsFilter>({});
  // Top-level section, and the active detail tab within a section.
  const [helpOpen, setHelpOpen] = useState(false);
  const [section, setSection] = useState<string>("overview");
  const [tab, setTab] = useState<string>("pages");
  /**
   * Empty = all sites.
   *
   * Only the raw selection is stored; the scope actually queried is derived
   * below. Clearing this in an effect instead let one render go out with the
   * previous workspace's site ids attached, which the server answers with a
   * 404 — the request is asking this workspace about somebody else's sites.
   */
  const [pickedSites, setPickedSites] = useState<string[]>([]);

  const { sites } = useSites(active?._id);

  /**
   * The selection, narrowed to sites that exist in the workspace currently
   * loaded. Computed during render, so the very first render after a switch
   * already carries a valid scope rather than a stale one.
   */
  const siteScope = useMemo(() => {
    if (!pickedSites.length) return [];
    const owned = new Set(sites.map((s) => s.siteId));
    return pickedSites.filter((id) => owned.has(id));
  }, [pickedSites, sites]);

  // Narrowing the site scope swaps every number on the page — cover the swap
  // with the same transition the workspace switcher uses.
  const scopeSwitch = useSwitchOverlay(siteScope.join(",") || "all");
  const { stats, loading: statsLoading, refetching, refresh, refreshing, lastUpdated } =
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

  const addFilter = (key: keyof StatsFilter, value: string) =>
    setFilter((f) => ({ ...f, [key]: value }));
  const removeFilter = (key: keyof StatsFilter) =>
    setFilter((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
  const clearFilter = () => setFilter({});

  // The visible window, as ISO bounds, so markers can be fetched for exactly
  // what is on screen. A preset carries no explicit bounds, so its start is
  // derived from its length; "custom" already has both.
  // Memoised on the range alone: computing `Date.now()` inline would produce a
  // new query argument on every render and refetch forever.
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
  const markers = (markerArgs?.wid === active?._id ? markerData : undefined) ?? [];

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

  const [deletingMarker, setDeletingMarker] = useState<string | null>(null);

  const handleDeleteMarker = async (marker: Marker) => {
    if (!active?._id) return;
    setDeletingMarker(marker.id);
    try {
      await deleteMarker({ wid: active._id, id: marker.id }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not delete that marker."));
    } finally {
      setDeletingMarker(null);
    }
  };

  // Saved segments for this workspace. Skipped until a workspace is known —
  // the endpoint is workspace-scoped and there is nothing to ask for yet.
  const { currentData: segments = [] } = useGetSegmentsQuery(active?._id ?? "", {
    skip: !active?._id,
  });
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

  const handleDeleteSegment = async (segment: Segment) => {
    if (!active?._id) return;
    setBusySegment(segment.id);
    try {
      await deleteSegment({ wid: active._id, id: segment.id }).unwrap();
      notify.success(`Deleted "${segment.name}"`);
    } catch (e) {
      notify.error(errMessage(e, "Could not delete that segment."));
    } finally {
      setBusySegment(null);
    }
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

  // The last payload we successfully rendered. Switching range empties `stats`
  // until the new one arrives, and blanking the whole page to a skeleton each
  // time would tear the header and range switcher out from under the cursor —
  // so keep showing the previous numbers, dimmed, while the new range loads.
  const shown = useRef(stats);
  if (stats) shown.current = stats;
  const view = stats ?? shown.current;

  /**
   * The chart series, with the comparison period folded in as extra keys on the
   * same points.
   *
   * Joined by position rather than by bucket label: the baseline's labels are
   * its own dates ("03-14"), so matching on them would line nothing up. The
   * server buckets both windows by the current window's rule, which makes the
   * n-th baseline bucket the counterpart of the n-th current one.
   *
   * Sits above the early returns below, because a hook cannot be called
   * conditionally.
   */
  const series = useMemo(() => {
    const current = view?.timeseries ?? [];
    const baseline = view?.comparison?.timeseries;
    if (!baseline?.length) return current;
    return current.map((p, i) => ({
      ...p,
      compareViews: baseline[i]?.views ?? 0,
      compareVisitors: baseline[i]?.visitors ?? 0,
      // Kept for the tooltip, which should name the date being compared to
      // rather than just "previous".
      compareBucket: baseline[i]?.bucket ?? "",
    }));
  }, [view?.timeseries, view?.comparison?.timeseries]);

  // Skeleton only on a true first load, when there is nothing to show at all.
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

  const siteCount = view?.siteCount ?? 0;
  // Impressions and scroll depth cannot exist for a site on an older script, so
  // their empty states should say that rather than "waiting for data".
  const anyOutdated = (view?.outdatedSites?.length ?? 0) > 0;
  const d = view?.deltas;
  const hasData = (view?.pageviews ?? 0) > 0;

  const comparing = Boolean(view?.comparison?.timeseries?.length);

  /**
   * Fetches one breakdown across both periods, for whichever cards have their
   * compare toggle on.
   *
   * Passed down as a function rather than called here so each card owns its own
   * request: the query is skipped until that card is toggled on, and RTK Query
   * caches per dimension, so opening the same panel again is free. Every card
   * gets today's range, filter and site scope automatically, which is what
   * keeps the comparison describing the same slice as the page around it.
   */
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
    { icon: Users, label: t("analytics.stat.visitors"), value: view?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors",
      hint: "Distinct people in this period. A visitor is a privacy-friendly daily hash of IP and browser — no cookies, so the same person on two days counts twice." },
    { icon: Eye, label: t("analytics.stat.pageviews"), value: view?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views",
      hint: "Every page load, including SPA route changes. One visitor can rack up many pageviews." },
    { icon: Layers, label: t("analytics.stat.sessions"), value: view?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null,
      hint: "A visit — one or more pageviews with no 30-minute gap. A returning visitor later in the day starts a fresh session." },
    { icon: Radio, label: t("analytics.stat.live"), value: view?.live ?? 0, color: "green", live: true,
      hint: "Distinct visitors active in the last 5 minutes, updated as the page refreshes." },
  ];

  const engagement = [
    { icon: MousePointerClick, label: t("analytics.stat.bounce"), value: `${view?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true,
      hint: "Share of sessions that left after a single pageview without interacting. Lower is usually better." },
    { icon: Timer, label: t("analytics.stat.avgSession"), value: duration(view?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null,
      hint: "Average visible time across a whole visit. A backgrounded tab doesn't count, so this is real attention time." },
    { icon: Timer, label: t("analytics.stat.avgTimeOnPage"), value: duration(view?.avgTimeOnPageMs ?? 0), color: "cyan",
      hint: "Average visible time on a single page before moving on." },
    { icon: Layers, label: t("analytics.stat.pagesPerSession"), value: view?.pagesPerSession ?? 0, color: "amber", delta: d?.pagesPerSession ?? null,
      hint: "How many pages a typical visit touches. Higher means people explore more." },
  ];

  // Top-level sections. "Overview" is just the headline widgets; the rest each
  // hold a small set of detail views, so nothing is buried in a long scroll.
  type SubTab = { value: string; label: string; icon: any };
  const SECTIONS: { value: string; label: string; icon: any; tabs: SubTab[] }[] = [
    { value: "overview", label: t("analytics.sec.overview"), icon: LayoutDashboard, tabs: [] },
    {
      value: "behavior",
      label: t("analytics.sec.behavior"),
      icon: ArrowDownWideNarrow,
      tabs: [
        { value: "pages", label: t("analytics.tab.pages"), icon: Eye },
        { value: "engagement", label: t("analytics.tab.engagement"), icon: ArrowDownWideNarrow },
        { value: "clicks", label: t("analytics.tab.clicks"), icon: MousePointerClick },
      ],
    },
    {
      value: "acquisition",
      label: t("analytics.sec.acquisition"),
      icon: Tag,
      tabs: [
        { value: "sources", label: t("analytics.tab.sources"), icon: Tag },
        { value: "geo", label: t("analytics.tab.geo"), icon: Globe2 },
        { value: "tech", label: t("analytics.tab.tech"), icon: AppWindow },
      ],
    },
    {
      value: "conversion",
      label: t("analytics.sec.conversion"),
      icon: Target,
      tabs: [
        { value: "goals", label: t("analytics.tab.goals"), icon: Target },
        { value: "events", label: t("analytics.tab.events"), icon: Zap },
        { value: "funnel", label: t("analytics.tab.funnel"), icon: GitBranch },
        { value: "retention", label: t("analytics.tab.retention"), icon: Repeat },
        { value: "errors", label: t("analytics.tab.errors"), icon: AlertTriangle },
      ],
    },
  ];

  const activeSection = SECTIONS.find((s) => s.value === section) ?? SECTIONS[0];

  // Switch section: jump to its first detail tab so a panel is always showing.
  const goSection = (value: string) => {
    setSection(value);
    const s = SECTIONS.find((x) => x.value === value);
    if (s && s.tabs.length) setTab(s.tabs[0].value);
  };

  return (
    <AppShell>
      {scopeSwitch.active && (
        <SwitchOverlay
          label={
            siteScope.length === 0
              ? "All sites"
              : siteScope.length === 1
              ? sites.find((s) => s.siteId === siteScope[0])?.name ?? "1 site"
              : `${siteScope.length} sites`
          }
          sublabel="Updating analytics"
          onDone={scopeSwitch.dismiss}
        />
      )}
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
        deletingId={deletingMarker}
      />

      <Group justify="space-between" align="flex-start" mb="lg" gap="md" wrap="wrap">
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <Title order={1}>{t("analytics.title")}</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Aggregated across {siteCount} site{siteCount === 1 ? "" : "s"} in <b>{active.name}</b>.
            {/* Read off the payload rather than the picker: the server may have
                fallen back to "previous" if the plan doesn't include the
                baseline that was asked for, and the caption has to describe
                what is actually on screen. */}
            {view?.comparison?.mode === "yoy"
              ? " Changes compare to the same period last year."
              : view?.comparison?.mode === "custom"
                ? ` Changes compare to the ${range} from ${dayjs(view.comparison.since).format("MMM D, YYYY")}.`
                : ` Changes compare to the previous ${range}.`}
          </Text>
        </div>
        <Group gap="sm" wrap="wrap" justify="flex-end" className="an-toolbar">
          <Group gap="sm" wrap="wrap" justify="flex-end" className="an-toolbar-btns">
            <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
            <SiteFilter sites={sites} selected={siteScope} onChange={setPickedSites} />
            <ExportMenu
              workspaceId={active?._id}
              range={range}
              from={rangeState.from}
              to={rangeState.to}
              filter={serializeFilter(filter)}
              sites={siteScope}
            />
            {/* Same help affordance as the dashboard — every metric on this page
                has a plain-language definition behind it. */}
            <MTooltip label={t("analytics.helpTooltip")} withArrow>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => setHelpOpen(true)}
                aria-label={t("analytics.help")}
              >
                <HelpCircle size={17} />
              </ActionIcon>
            </MTooltip>
          </Group>
          <Group gap="xs" wrap="nowrap" className="an-range">
            {(statsLoading || refetching) && (
              <Loader size="xs" color="emerald" type="oval" />
            )}
            {/* A second range change mid-flight would land whichever request
                finishes last, so lock the control while one is in flight. */}
            <RangePicker
              value={rangeState}
              onChange={setRangeState}
              disabled={statsLoading || refetching}
            />
            <ComparePicker
              value={compareState}
              onChange={setCompareState}
              disabled={statsLoading || refetching}
            />
          </Group>
        </Group>
      </Group>

      {/* Primary section nav. Overview keeps the headline widgets; the rest hold
          the detail views, grouped by the question each answers. */}
      {/* A segmented rail rather than a row of filled buttons: eight solid
          buttons all read as primary actions and fight the page for weight. */}
      <Box className="section-rail" mb="lg">
        {SECTIONS.map((s) => {
          const isActive = section === s.value;
          const Icon = s.icon;
          return (
            <UnstyledButton
              key={s.value}
              className="section-tab"
              data-active={isActive}
              onClick={() => goSection(s.value)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={15} />
              <Text size="sm" fw={isActive ? 600 : 500}>
                {s.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Box>

      {/* Active segment. Clicking any breakdown row below adds a chip here and
          re-scopes every number to that segment. */}
      <FilterBar
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

      {/* The previous range stays on screen, dimmed, until the new one lands —
          so the numbers visibly go stale rather than the page going blank. */}
      <Box
        style={{
          opacity: statsLoading ? 0.45 : 1,
          pointerEvents: statsLoading ? "none" : undefined,
          transition: "opacity 140ms ease",
        }}
      >

      {section === "overview" && <>
      {/* audience */}
      <SectionLabel icon={Users}>{t("analytics.sectionAudience")}</SectionLabel>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {audience.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* engagement */}
      <SectionLabel icon={ArrowDownWideNarrow}>{t("analytics.sectionEngagement")}</SectionLabel>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {engagement.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* traffic chart + live */}
      <SectionLabel icon={Eye}>{t("analytics.sectionTraffic")}</SectionLabel>
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="xl">
        <div className="grid-span-2">
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Group justify="space-between" mb="md" wrap="nowrap">
              <Group gap={8} wrap="nowrap">
                <Text fw={600} c="dimmed" size="sm">{t("analytics.trafficOverTime")}</Text>
                <MarkerButton onClick={() => setMarkersOpen(true)} count={markers.length} />
              </Group>
              {hasData && (
                <Group gap="md" wrap="nowrap">
                  <LegendDot color="var(--accent)">Pageviews</LegendDot>
                  <LegendDot color="#22d3ee">Visitors</LegendDot>
                  {comparing && <LegendDot color="var(--muted)">Baseline</LegendDot>}
                  <MarkerLegend markers={markers} />
                </Group>
              )}
            </Group>
            {hasData ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: CHART, strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={2.5} fill="url(#g)" dot={false} activeDot={{ r: 5, fill: "var(--accent)" }} />
                  <Area type="monotone" dataKey="visitors" stroke="#22d3ee" strokeWidth={2} fill="url(#g2)" dot={false} />
                  {/* The baseline: a dashed unfilled line, drawn before the
                      markers so it reads as background against the two filled
                      areas rather than competing with them. */}
                  {comparing && (
                    <Area
                      type="monotone"
                      dataKey="compareViews"
                      stroke="var(--muted)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="none"
                      dot={false}
                      activeDot={false}
                    />
                  )}
                  {/* Deploys and campaigns, drawn after the areas so the lines
                      sit on top of the fills rather than under them. */}
                  {markerLines(markers, series, range === "1h" || range === "24h")}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Center h={260}>
                <Stack align="center" gap={6}>
                  <AnalyticsArt />
                  <Text fw={600} size="sm" mt="xs">{t("analytics.noPageviews")}</Text>
                  <Text c="dimmed" size="xs" ta="center" maw={320}>
                    Add a site in Workspaces and paste its snippet into your app.
                  </Text>
                  <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6}>Manage sites</Button>
                </Stack>
              </Center>
            )}
          </Card>
        </div>
        <LiveNow stats={view} />
      </SimpleGrid>
      </>}

      {section !== "overview" && <>
      {/* Detail views for the active section. One tidy row of pills — a handful
          per section, so nothing scrolls off-screen. */}
      <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
        <Group gap={6} wrap="wrap">
          {activeSection.tabs.map((t) => {
            const active = tab === t.value;
            const Icon = t.icon;
            return (
              <Button
                key={t.value}
                size="sm"
                radius="md"
                variant={active ? "filled" : "light"}
                color={active ? "emerald" : "gray"}
                leftSection={<Icon size={14} />}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </Button>
            );
          })}
        </Group>
        <Text size="xs" c="dimmed" visibleFrom="sm">
          Tip: click any row to filter the whole dashboard by it.
        </Text>
      </Group>

      <Tabs value={tab} onChange={(v) => v && setTab(v)} variant="pills" color="emerald" keepMounted={false}>

        <Tabs.Panel value="pages">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <BarList title={t("analytics.list.topPages")} icon={Eye} items={view?.topPages ?? []} color="teal"
                     filterKey="path" onFilter={addFilter}
                     dimension="path" useCompare={useBreakdownCompare} />
            <BarList title={t("analytics.list.entryPages")} icon={LogIn} items={view?.entryPages ?? []} color="emerald"
                     empty="No sessions recorded yet" filterKey="path" onFilter={addFilter} />
            <BarList title={t("analytics.list.exitPages")} icon={LogOut} items={view?.exitPages ?? []} color="pink"
                     empty="No completed sessions yet" filterKey="path" onFilter={addFilter} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="engagement">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="lg">
            <ScrollPanel items={view?.scrollDepth ?? []} outdated={anyOutdated} />
            <LandingPanel items={view?.landingPages ?? []} />
          </SimpleGrid>
          <Heatmap cells={view?.heatmap ?? []} />
        </Tabs.Panel>

        <Tabs.Panel value="sources">
          {/* Masonry rather than a grid: these lists differ wildly in length —
              three channels beside nine referrers — and a grid row would pad the
              short card out to the tall one's height, leaving a dead block. */}
          <div className="masonry">
            <BarList title={t("analytics.list.channels")} icon={Split} items={view?.channels ?? []} color="emerald"
                     empty="No traffic yet" fill={false} />
            <BarList title={t("analytics.list.referrers")} icon={Tag} items={view?.topReferrers ?? []} color="cyan"
                     filterKey="referrer" onFilter={addFilter} fill={false}
                     dimension="referrer" useCompare={useBreakdownCompare} />
            <VisitorSplitPanel split={view?.visitorSplit} />
            <BarList title={t("analytics.list.utmSources")} icon={Tag} items={view?.utmSources ?? []} color="teal"
                     filterKey="utmSource" onFilter={addFilter} fill={false}
                     dimension="utmSource" useCompare={useBreakdownCompare} />
            <BarList title={t("analytics.list.utmCampaigns")} icon={Tag} items={view?.utmCampaigns ?? []} color="grape"
                     filterKey="utmCampaign" onFilter={addFilter} fill={false}
                     dimension="utmCampaign" useCompare={useBreakdownCompare} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="tech">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <BarList title={t("analytics.list.browsers")} icon={AppWindow} items={view?.browsers ?? []} color="cyan"
                     filterKey="browser" onFilter={addFilter}
                     dimension="browser" useCompare={useBreakdownCompare} />
            <BarList title={t("analytics.list.operatingSystems")} icon={MonitorSmartphone} items={view?.operatingSystems ?? []} color="teal"
                     filterKey="os" onFilter={addFilter}
                     dimension="os" useCompare={useBreakdownCompare} />
            <BarList title={t("analytics.list.devices")} icon={MonitorSmartphone} items={view?.devices ?? []} color="emerald"
                     filterKey="device" onFilter={addFilter}
                     dimension="device" useCompare={useBreakdownCompare} />
            <BarList title={t("analytics.list.screenSizes")} icon={MonitorSmartphone} items={view?.screenSizes ?? []} color="grape" />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="geo">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div className="grid-span-2">
              <WorldMap countries={view?.countries ?? []} />
            </div>
            <Stack gap="lg">
              <BarList
                title={t("analytics.list.countries")}
                icon={Globe2}
                items={view?.countries ?? []}
                color="emerald"
                filterKey="country"
                onFilter={addFilter}
                format={(k) => (
                  <span>
                    <span style={{ marginRight: 6 }}>{countryFlag(k)}</span>
                    {countryLabel(k)}
                  </span>
                )}
              />
              <BarList title={t("analytics.list.languages")} icon={Languages} items={view?.languages ?? []} color="cyan"
                       filterKey="language" onFilter={addFilter}
                       dimension="language" useCompare={useBreakdownCompare} />
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="clicks">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div className="grid-span-2">
              <ClicksPanel clicks={view?.clicks ?? []} total={view?.clickCount ?? 0} limit={15} />
            </div>
            <OutboundPanel items={view?.outboundClicks ?? []} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="events">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div className="grid-span-2">
              <CustomEventsPanel
                items={view?.customEvents ?? []}
                totalRevenue={view?.totalRevenue ?? 0}
              />
            </div>
            <Card withBorder radius="lg" padding="lg" h="100%">
              <Group gap={8} mb="md">
                <Zap size={15} className="sect-ic" />
                <Text fw={600} c="dimmed" size="sm">About events</Text>
              </Group>
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Custom events are actions you care about — a signup, a purchase, a
                  plan upgrade — sent from your own site with one line of code.
                </Text>
                <Text size="sm" c="dimmed">
                  Conversion rate is the share of visitors in this period who fired
                  the event at least once.
                </Text>
                <Text size="sm" c="dimmed">
                  Pass a numeric <b>value</b> in the event props — e.g.{" "}
                  <code>{`{ value: 49 }`}</code> — and it&apos;s summed into revenue
                  per event and overall.
                </Text>
                <Button
                  component={Link}
                  to="/app/developers"
                  variant="light"
                  size="xs"
                  mt="xs"
                  leftSection={<AppWindow size={14} />}
                >
                  See the tracking docs
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="goals">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <GoalsPanel workspaceId={active._id} goals={view?.goals ?? []} />
            <Card withBorder radius="lg" padding="lg" h="100%">
              <Group gap={8} mb="md">
                <Target size={15} className="sect-ic" />
                <Text fw={600} c="dimmed" size="sm">About goals</Text>
              </Group>
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  A goal is an outcome you care about — reaching a page like{" "}
                  <code>/thank-you</code>, or firing a custom event like{" "}
                  <code>purchase</code>. Each goal is scored over the range you&apos;re
                  viewing.
                </Text>
                <Text size="sm" c="dimmed">
                  Conversion rate is the share of visitors in this period who
                  converted at least once — a visitor who converts twice still
                  counts once.
                </Text>
                <Text size="sm" c="dimmed">
                  Goals re-score past traffic, so adding one doesn&apos;t lose
                  history and removing one keeps your events intact.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="funnel">
          <PlanGate
            locked={funnelLocked}
            title="Funnels need Starter or Pro"
            body="Track step-by-step drop-off across pages and events. Upgrade to unlock funnel analysis."
          >
            <FunnelBuilder workspaceId={active._id} range={range} stats={view} sites={siteScope} />
          </PlanGate>
        </Tabs.Panel>

        <Tabs.Panel value="retention">
          <RetentionGrid workspaceId={active._id} sites={siteScope} />
        </Tabs.Panel>

        <Tabs.Panel value="errors">
          <ErrorsPanel items={view?.errors ?? []} />
        </Tabs.Panel>
      </Tabs>
      </>}
      </Box>
    </AppShell>
  );
}
