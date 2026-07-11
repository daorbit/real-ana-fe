import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Center, Badge, Progress,
} from "@mantine/core";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import {
  Users, Eye, Radio, Globe, BarChart3, FolderKanban, Plus, ArrowUpRight,
  MousePointerClick, Timer, Layers, Globe2, SlidersHorizontal,
  LogIn, LogOut, AppWindow, MonitorSmartphone, Languages, Tag,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { AnalyticsArt } from "../components/Brand";
import { RefreshButton } from "../components/Refresh";
import { WorldMap } from "../components/WorldMap";
import { CustomizeDrawer } from "../components/CustomizeDrawer";
import { useStats, useSites, useHomeWidgets, WIDGETS } from "../hooks";
import type { WidgetId } from "../hooks";
import { countryFlag, countryLabel, duration, num } from "../utils";
import { useWorkspace } from "../workspace";
import type { Bucket, Stats } from "../types";

/** Compact ranked list used for every Home breakdown panel. */
function MiniList({
  title, items, icon: Icon, format, empty,
}: {
  title: string;
  items: Bucket[];
  icon: any;
  format?: (key: string) => React.ReactNode;
  empty: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <Icon size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>
      {items.length === 0 ? (
        <Center py="lg"><Text c="dimmed" size="xs">{empty}</Text></Center>
      ) : (
        <Stack gap="sm">
          {items.slice(0, 5).map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={3} wrap="nowrap">
                <Text size="sm" truncate style={{ flex: 1 }}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Text size="sm" fw={700}>{num(i.count)}</Text>
              </Group>
              <Progress value={(i.count / max) * 100} size="xs" radius="xl" color="teal" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function TrafficCard({ stats }: { stats: Stats | null }) {
  const series = stats?.timeseries ?? [];
  const hasData = (stats?.pageviews ?? 0) > 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Traffic — last 24h</Text>
        <Button component={Link} to="/app/analytics" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
          Details
        </Button>
      </Group>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2.5} fill="url(#hg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Stack align="center" gap="xs" py="md">
          <AnalyticsArt />
          <Text fw={600} size="sm" mt="sm">No traffic yet</Text>
          <Text c="dimmed" size="xs" ta="center" maw={340}>
            Install the tracking snippet on a site and live visitors will appear here.
          </Text>
          <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6} leftSection={<Plus size={14} />}>
            Get tracking snippet
          </Button>
        </Stack>
      )}
    </Card>
  );
}

function LivePagesCard({ stats }: { stats: Stats | null }) {
  const pages = stats?.livePages ?? [];
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className="status-dot live" style={{ background: "var(--mantine-color-teal-6)" }} />
          <Text fw={600} c="dimmed" size="sm">Right now</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">{stats?.live ?? 0}</Badge>
      </Group>
      {pages.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="xs" ta="center">Nobody on the site in the last 5 minutes</Text>
        </Center>
      ) : (
        <Stack gap="xs">
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

export default function Home() {
  const { active, loading } = useWorkspace();
  const { stats, refresh, refreshing, lastUpdated } = useStats(active?._id, "24h");
  const { sites } = useSites(active?._id);
  const { enabled, has, toggle, reset, clear } = useHomeWidgets();
  const [customizing, setCustomizing] = useState(false);

  if (loading) return <AppShell><Text c="dimmed">Loading…</Text></AppShell>;

  if (!active) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size={56} radius="md"><FolderKanban size={28} /></ThemeIcon>
            <Text c="dimmed">No workspace yet. Create one to get started.</Text>
            <Button component={Link} to="/app/workspaces">Go to Workspaces</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const d = stats?.deltas;
  const series = stats?.timeseries ?? [];

  const METRICS: Record<string, any> = {
    visitors: { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors" },
    pageviews: { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views" },
    live: { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
    sessions: { icon: Layers, label: "Sessions", value: stats?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null },
    bounce: { icon: MousePointerClick, label: "Bounce rate", value: `${stats?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true },
    avgSession: { icon: Timer, label: "Avg. session", value: duration(stats?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null },
    pagesPerSession: { icon: Layers, label: "Pages / session", value: stats?.pagesPerSession ?? 0, color: "cyan", delta: d?.pagesPerSession ?? null },
    sites: { icon: Globe, label: "Sites", value: sites.length, color: "amber" },
  };

  const flag = (k: string) => (
    <span>
      <span style={{ marginRight: 6 }}>{countryFlag(k)}</span>
      {countryLabel(k)}
    </span>
  );

  const LISTS: Record<string, { title: string; icon: any; items: Bucket[]; empty: string; format?: (k: string) => React.ReactNode }> = {
    topPages: { title: "Top pages", icon: Eye, items: stats?.topPages ?? [], empty: "No pageviews yet" },
    entryPages: { title: "Entry pages", icon: LogIn, items: stats?.entryPages ?? [], empty: "No sessions yet" },
    exitPages: { title: "Exit pages", icon: LogOut, items: stats?.exitPages ?? [], empty: "No completed sessions yet" },
    topReferrers: { title: "Referrers", icon: ArrowUpRight, items: stats?.topReferrers ?? [], empty: "No referrers yet" },
    topCountries: { title: "Countries", icon: Globe2, items: stats?.countries ?? [], empty: "No location data yet", format: flag },
    browsers: { title: "Browsers", icon: AppWindow, items: stats?.browsers ?? [], empty: "No data yet" },
    operatingSystems: { title: "Operating systems", icon: MonitorSmartphone, items: stats?.operatingSystems ?? [], empty: "No data yet" },
    devices: { title: "Devices", icon: MonitorSmartphone, items: stats?.devices ?? [], empty: "No data yet" },
    screenSizes: { title: "Screen sizes", icon: MonitorSmartphone, items: stats?.screenSizes ?? [], empty: "No data yet" },
    languages: { title: "Languages", icon: Languages, items: stats?.languages ?? [], empty: "No data yet" },
    utmSources: { title: "UTM sources", icon: Tag, items: stats?.utmSources ?? [], empty: "No campaigns yet" },
    utmCampaigns: { title: "UTM campaigns", icon: Tag, items: stats?.utmCampaigns ?? [], empty: "No campaigns yet" },
  };

  const metricIds = WIDGETS.filter((w) => w.group === "Metrics" && has(w.id)).map((w) => w.id);
  const listIds = WIDGETS.filter((w) => w.group === "Breakdowns" && has(w.id)).map((w) => w.id);
  const showTraffic = has("traffic" as WidgetId);
  const showLive = has("livePages" as WidgetId);
  const showMap = has("worldMap" as WidgetId);

  return (
    <AppShell>
      <CustomizeDrawer
        opened={customizing}
        onClose={() => setCustomizing(false)}
        enabled={enabled}
        has={has}
        toggle={toggle}
        reset={reset}
        clear={clear}
      />

      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>
            A quick look at <b>{active.name}</b> — last 24 hours.
          </Text>
        </div>
        <Group gap="sm">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <Button variant="default" leftSection={<SlidersHorizontal size={15} />} onClick={() => setCustomizing(true)}>
            Customize
          </Button>
          <Button component={Link} to="/app/analytics" leftSection={<BarChart3 size={16} />}>
            Full analytics
          </Button>
        </Group>
      </Group>

      {enabled.length === 0 ? (
        <Center mih="40vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="gray" size={52} radius="md"><SlidersHorizontal size={24} /></ThemeIcon>
            <Text fw={600} size="sm">Your home page is empty</Text>
            <Text c="dimmed" size="xs">Choose the widgets you want to see at a glance.</Text>
            <Button size="xs" variant="light" mt={4} onClick={() => setCustomizing(true)}>Customize</Button>
          </Stack>
        </Center>
      ) : (
        <>
          {metricIds.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: Math.min(4, metricIds.length) }} mb="lg">
              {metricIds.map((id, i) => (
                <motion.div key={id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
                  <StatCard {...METRICS[id]} />
                </motion.div>
              ))}
            </SimpleGrid>
          )}

          {(showTraffic || showLive) && (
            <SimpleGrid cols={{ base: 1, lg: showTraffic && showLive ? 3 : 1 }} spacing="lg" mb="lg">
              {showTraffic && (
                <motion.div
                  style={showLive ? { gridColumn: "span 2" } : undefined}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                >
                  <TrafficCard stats={stats} />
                </motion.div>
              )}
              {showLive && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }}>
                  <LivePagesCard stats={stats} />
                </motion.div>
              )}
            </SimpleGrid>
          )}

          {showMap && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.35 }} style={{ marginBottom: "var(--mantine-spacing-lg)" }}>
              <WorldMap countries={stats?.countries ?? []} />
            </motion.div>
          )}

          {listIds.length > 0 && (
            <SimpleGrid cols={{ base: 1, md: 2, lg: Math.min(3, listIds.length) }} spacing="lg">
              {listIds.map((id, i) => {
                const l = LISTS[id];
                if (!l) return null;
                return (
                  <motion.div key={id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.04, duration: 0.35 }}>
                    <MiniList title={l.title} icon={l.icon} items={l.items} empty={l.empty} format={l.format} />
                  </motion.div>
                );
              })}
            </SimpleGrid>
          )}
        </>
      )}
    </AppShell>
  );
}
