import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Title, Text, Group, Button, SimpleGrid, Card, Progress,
  Stack, Center, ThemeIcon, Badge, Tabs, Box, Loader, UnstyledButton,
} from "@mantine/core";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users, Eye, Radio, FolderKanban, Inbox, MousePointerClick, Timer,
  Layers, LogIn, LogOut, AppWindow, MonitorSmartphone, Globe2, Languages, Tag,
  ArrowDownWideNarrow, Zap, Filter, GitBranch, Repeat,
  Split, Target, AlertTriangle, LayoutDashboard,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { AnalyticsArt } from "../components/Brand";
import { StatCard } from "../components/StatCard";
import { WorldMap } from "../components/WorldMap";
import { ClicksPanel } from "../components/ClicksPanel";
import { Heatmap } from "../components/Heatmap";
import { ScrollPanel, LandingPanel } from "../components/EngagementPanels";
import { CustomEventsPanel } from "../components/CustomEventsPanel";
import { FunnelBuilder } from "../components/FunnelBuilder";
import { RetentionGrid } from "../components/RetentionGrid";
import { GoalsPanel } from "../components/GoalsPanel";
import { OutboundPanel, ErrorsPanel } from "../components/OutboundErrorsPanels";
import { FilterBar } from "../components/FilterBar";
import { RefreshButton } from "../components/Refresh";
import { SiteFilter } from "../components/SiteFilter";
import { RangePicker, type RangeState } from "../components/RangePicker";
import { ExportMenu } from "../components/ExportMenu";
import { AnalyticsSkeleton } from "../components/Skeletons";
import { useStats, useSites } from "../hooks";
import { countryFlag, countryLabel, duration, share, num } from "../utils";
import { useWorkspace } from "../workspace";
import type { Stats, Bucket, StatsFilter } from "../types";
import { serializeFilter } from "../types";

const CHART = "#10b981";

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

function BarList({
  title,
  items,
  color = "teal",
  icon: Icon,
  format,
  empty = "Waiting for data…",
  filterKey,
  onFilter,
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
}) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));
  const clickable = Boolean(filterKey && onFilter);

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        {Icon && <Icon size={15} className="sect-ic" />}
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>

      {items.length === 0 ? (
        <Center py="lg" mih={120}>
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">{empty}</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {items.map((i) => (
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
                  <Text size="xs" c="dimmed">{share(i.count, total)}</Text>
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
  const pages = stats?.livePages ?? [];
  const live = stats?.live ?? 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className="status-dot live" style={{ background: "var(--mantine-color-teal-6)" }} />
          <Text fw={600} c="dimmed" size="sm">Right now</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">
          {live} visitor{live === 1 ? "" : "s"}
        </Badge>
      </Group>

      {pages.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed" size="xs">Nobody on the site in the last 5 minutes</Text>
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
  const { active, loading } = useWorkspace();
  const [rangeState, setRangeState] = useState<RangeState>({ preset: "24h" });
  const range = rangeState.preset;
  const [filter, setFilter] = useState<StatsFilter>({});
  // Top-level section, and the active detail tab within a section.
  const [section, setSection] = useState<string>("overview");
  const [tab, setTab] = useState<string>("pages");
  // Empty = all sites. siteIds don't carry across workspaces, so reset on switch.
  const [siteScope, setSiteScope] = useState<string[]>([]);
  useEffect(() => setSiteScope([]), [active?._id]);

  const { sites } = useSites(active?._id);
  const { stats, loading: statsLoading, refetching, refresh, refreshing, lastUpdated } =
    useStats(active?._id, range, serializeFilter(filter), siteScope, rangeState.from, rangeState.to);

  const addFilter = (key: keyof StatsFilter, value: string) =>
    setFilter((f) => ({ ...f, [key]: value }));
  const removeFilter = (key: keyof StatsFilter) =>
    setFilter((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
  const clearFilter = () => setFilter({});

  // The last payload we successfully rendered. Switching range empties `stats`
  // until the new one arrives, and blanking the whole page to a skeleton each
  // time would tear the header and range switcher out from under the cursor —
  // so keep showing the previous numbers, dimmed, while the new range loads.
  const shown = useRef(stats);
  if (stats) shown.current = stats;
  const view = stats ?? shown.current;

  // Skeleton only on a true first load, when there is nothing to show at all.
  if (loading || (active && !view)) {
    return <AppShell><AnalyticsSkeleton /></AppShell>;
  }

  if (!active) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size={56} radius="md"><FolderKanban size={28} /></ThemeIcon>
            <Text c="dimmed">No workspace selected.</Text>
            <Button component={Link} to="/app/workspaces">Go to Workspaces</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const siteCount = view?.siteCount ?? 0;
  // Impressions and scroll depth cannot exist for a site on an older script, so
  // their empty states should say that rather than "waiting for data".
  const anyOutdated = (view?.outdatedSites?.length ?? 0) > 0;
  const d = view?.deltas;
  const series = view?.timeseries ?? [];
  const hasData = (view?.pageviews ?? 0) > 0;

  const audience = [
    { icon: Users, label: "Visitors", value: view?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors",
      hint: "Distinct people in this period. A visitor is a privacy-friendly daily hash of IP and browser — no cookies, so the same person on two days counts twice." },
    { icon: Eye, label: "Pageviews", value: view?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views",
      hint: "Every page load, including SPA route changes. One visitor can rack up many pageviews." },
    { icon: Layers, label: "Sessions", value: view?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null,
      hint: "A visit — one or more pageviews with no 30-minute gap. A returning visitor later in the day starts a fresh session." },
    { icon: Radio, label: "Live now", value: view?.live ?? 0, color: "green", live: true,
      hint: "Distinct visitors active in the last 5 minutes, updated as the page refreshes." },
  ];

  const engagement = [
    { icon: MousePointerClick, label: "Bounce rate", value: `${view?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true,
      hint: "Share of sessions that left after a single pageview without interacting. Lower is usually better." },
    { icon: Timer, label: "Avg. session", value: duration(view?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null,
      hint: "Average visible time across a whole visit. A backgrounded tab doesn't count, so this is real attention time." },
    { icon: Timer, label: "Avg. time on page", value: duration(view?.avgTimeOnPageMs ?? 0), color: "cyan",
      hint: "Average visible time on a single page before moving on." },
    { icon: Layers, label: "Pages / session", value: view?.pagesPerSession ?? 0, color: "amber", delta: d?.pagesPerSession ?? null,
      hint: "How many pages a typical visit touches. Higher means people explore more." },
  ];

  // Top-level sections. "Overview" is just the headline widgets; the rest each
  // hold a small set of detail views, so nothing is buried in a long scroll.
  type SubTab = { value: string; label: string; icon: any };
  const SECTIONS: { value: string; label: string; icon: any; tabs: SubTab[] }[] = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, tabs: [] },
    {
      value: "behavior",
      label: "Behavior",
      icon: ArrowDownWideNarrow,
      tabs: [
        { value: "pages", label: "Pages", icon: Eye },
        { value: "engagement", label: "Engagement", icon: ArrowDownWideNarrow },
        { value: "clicks", label: "Clicks", icon: MousePointerClick },
      ],
    },
    {
      value: "acquisition",
      label: "Acquisition",
      icon: Tag,
      tabs: [
        { value: "sources", label: "Sources", icon: Tag },
        { value: "geo", label: "Geography", icon: Globe2 },
        { value: "tech", label: "Technology", icon: AppWindow },
      ],
    },
    {
      value: "conversion",
      label: "Conversion",
      icon: Target,
      tabs: [
        { value: "goals", label: "Goals", icon: Target },
        { value: "events", label: "Events", icon: Zap },
        { value: "funnel", label: "Funnel", icon: GitBranch },
        { value: "retention", label: "Retention", icon: Repeat },
        { value: "errors", label: "Errors", icon: AlertTriangle },
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
      <Group justify="space-between" align="flex-start" mb="lg" gap="md" wrap="wrap">
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <Title order={1}>Analytics</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Aggregated across {siteCount} site{siteCount === 1 ? "" : "s"} in <b>{active.name}</b>.
            Changes compare to the previous {range}.
          </Text>
        </div>
        <Group gap="sm" wrap="wrap" justify="flex-end">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <SiteFilter sites={sites} selected={siteScope} onChange={setSiteScope} />
          <ExportMenu
            workspaceId={active?._id}
            range={range}
            from={rangeState.from}
            to={rangeState.to}
            filter={serializeFilter(filter)}
            sites={siteScope}
          />
          <Group gap="xs" wrap="nowrap">
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
      <FilterBar filter={filter} onRemove={removeFilter} onClear={clearFilter} />

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
      <SectionLabel icon={Users}>Audience</SectionLabel>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {audience.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* engagement */}
      <SectionLabel icon={ArrowDownWideNarrow}>Engagement</SectionLabel>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {engagement.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* traffic chart + live */}
      <SectionLabel icon={Eye}>Traffic</SectionLabel>
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="xl">
        <div style={{ gridColumn: "span 2" }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Group justify="space-between" mb="md" wrap="nowrap">
              <Text fw={600} c="dimmed" size="sm">Traffic over time</Text>
              {hasData && (
                <Group gap="md" wrap="nowrap">
                  <LegendDot color="#10b981">Pageviews</LegendDot>
                  <LegendDot color="#22d3ee">Visitors</LegendDot>
                </Group>
              )}
            </Group>
            {hasData ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2.5} fill="url(#g)" dot={false} activeDot={{ r: 5, fill: "#34d399" }} />
                  <Area type="monotone" dataKey="visitors" stroke="#22d3ee" strokeWidth={2} fill="url(#g2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Center h={260}>
                <Stack align="center" gap={6}>
                  <AnalyticsArt />
                  <Text fw={600} size="sm" mt="xs">No pageviews yet</Text>
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
            <BarList title="Top pages" icon={Eye} items={view?.topPages ?? []} color="teal"
                     filterKey="path" onFilter={addFilter} />
            <BarList title="Entry pages" icon={LogIn} items={view?.entryPages ?? []} color="emerald"
                     empty="No sessions recorded yet" filterKey="path" onFilter={addFilter} />
            <BarList title="Exit pages" icon={LogOut} items={view?.exitPages ?? []} color="pink"
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
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="lg">
            <BarList title="Channels" icon={Split} items={view?.channels ?? []} color="emerald"
                     empty="No traffic yet" />
            <BarList title="Referrers" icon={Tag} items={view?.topReferrers ?? []} color="cyan"
                     filterKey="referrer" onFilter={addFilter} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <BarList title="UTM sources" icon={Tag} items={view?.utmSources ?? []} color="teal"
                     filterKey="utmSource" onFilter={addFilter} />
            <BarList title="UTM campaigns" icon={Tag} items={view?.utmCampaigns ?? []} color="grape"
                     filterKey="utmCampaign" onFilter={addFilter} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="tech">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <BarList title="Browsers" icon={AppWindow} items={view?.browsers ?? []} color="cyan"
                     filterKey="browser" onFilter={addFilter} />
            <BarList title="Operating systems" icon={MonitorSmartphone} items={view?.operatingSystems ?? []} color="teal"
                     filterKey="os" onFilter={addFilter} />
            <BarList title="Devices" icon={MonitorSmartphone} items={view?.devices ?? []} color="emerald"
                     filterKey="device" onFilter={addFilter} />
            <BarList title="Screen sizes" icon={MonitorSmartphone} items={view?.screenSizes ?? []} color="grape" />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="geo">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div style={{ gridColumn: "span 2" }}>
              <WorldMap countries={view?.countries ?? []} />
            </div>
            <Stack gap="lg">
              <BarList
                title="Countries"
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
              <BarList title="Languages" icon={Languages} items={view?.languages ?? []} color="cyan"
                       filterKey="language" onFilter={addFilter} />
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="clicks">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div style={{ gridColumn: "span 2" }}>
              <ClicksPanel clicks={view?.clicks ?? []} total={view?.clickCount ?? 0} limit={15} />
            </div>
            <OutboundPanel items={view?.outboundClicks ?? []} />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="events">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div style={{ gridColumn: "span 2" }}>
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
          <FunnelBuilder workspaceId={active._id} range={range} stats={view} sites={siteScope} />
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
