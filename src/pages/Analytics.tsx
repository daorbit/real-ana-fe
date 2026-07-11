import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Title, Text, Group, Button, SimpleGrid, Card, Progress,
  SegmentedControl, Stack, Center, ThemeIcon, Badge, Tabs,
} from "@mantine/core";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users, Eye, Radio, FolderKanban, Inbox, MousePointerClick, Timer,
  Layers, LogIn, LogOut, AppWindow, MonitorSmartphone, Globe2, Languages, Tag,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { AnalyticsArt } from "../components/Brand";
import { StatCard } from "../components/StatCard";
import { WorldMap } from "../components/WorldMap";
import { ClicksPanel } from "../components/ClicksPanel";
import { RefreshButton } from "../components/Refresh";
import { useStats } from "../hooks";
import { countryFlag, countryLabel, duration, share, num } from "../utils";
import { useWorkspace } from "../workspace";
import type { Stats, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];
const CHART = "#10b981";

function BarList({
  title,
  items,
  color = "teal",
  icon: Icon,
  format,
  empty = "Waiting for data…",
}: {
  title: string;
  items: Bucket[];
  color?: string;
  icon?: any;
  format?: (key: string) => React.ReactNode;
  empty?: string;
}) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        {Icon && <Icon size={15} className="sect-ic" />}
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>

      {items.length === 0 ? (
        <Center py="lg">
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">{empty}</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {items.map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Text size="sm" truncate style={{ flex: 1 }}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Group gap={6} wrap="nowrap">
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
    <Card withBorder radius="lg" padding="lg">
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
  const [range, setRange] = useState("24h");
  const { stats, refresh, refreshing, lastUpdated } = useStats(active?._id, range);

  if (loading) return <AppShell><Text c="dimmed">Loading…</Text></AppShell>;

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

  const siteCount = stats?.siteCount ?? 0;
  const d = stats?.deltas;
  const series = stats?.timeseries ?? [];
  const hasData = (stats?.pageviews ?? 0) > 0;

  const audience = [
    { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors" },
    { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views" },
    { icon: Layers, label: "Sessions", value: stats?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
  ];

  const engagement = [
    { icon: MousePointerClick, label: "Bounce rate", value: `${stats?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true },
    { icon: Timer, label: "Avg. session", value: duration(stats?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null },
    { icon: Timer, label: "Avg. time on page", value: duration(stats?.avgTimeOnPageMs ?? 0), color: "cyan" },
    { icon: Layers, label: "Pages / session", value: stats?.pagesPerSession ?? 0, color: "amber", delta: d?.pagesPerSession ?? null },
  ];

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={1}>Analytics</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Aggregated across {siteCount} site{siteCount === 1 ? "" : "s"} in <b>{active.name}</b>.
            Changes compare to the previous {range}.
          </Text>
        </div>
        <Group gap="sm">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <SegmentedControl value={range} onChange={setRange} data={RANGES} size="sm" />
        </Group>
      </Group>

      {/* audience */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
        {audience.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* engagement */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {engagement.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* traffic chart + live */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <div style={{ gridColumn: "span 2" }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Text fw={600} c="dimmed" size="sm" mb="md">Traffic over time</Text>
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
        <LiveNow stats={stats} />
      </SimpleGrid>

      {/* breakdowns */}
      <Tabs defaultValue="pages" variant="pills" color="emerald">
        <Tabs.List mb="lg">
          <Tabs.Tab value="pages" leftSection={<Eye size={14} />}>Pages</Tabs.Tab>
          <Tabs.Tab value="sources" leftSection={<Tag size={14} />}>Sources</Tabs.Tab>
          <Tabs.Tab value="tech" leftSection={<AppWindow size={14} />}>Technology</Tabs.Tab>
          <Tabs.Tab value="geo" leftSection={<Globe2 size={14} />}>Geography</Tabs.Tab>
          <Tabs.Tab value="clicks" leftSection={<MousePointerClick size={14} />}>Clicks</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pages">
          <SimpleGrid cols={{ base: 1, lg: 3 }}>
            <BarList title="Top pages" icon={Eye} items={stats?.topPages ?? []} color="teal" />
            <BarList title="Entry pages" icon={LogIn} items={stats?.entryPages ?? []} color="emerald"
                     empty="No sessions recorded yet" />
            <BarList title="Exit pages" icon={LogOut} items={stats?.exitPages ?? []} color="pink"
                     empty="No completed sessions yet" />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="sources">
          <SimpleGrid cols={{ base: 1, lg: 3 }}>
            <BarList title="Referrers" icon={Tag} items={stats?.topReferrers ?? []} color="cyan" />
            <BarList title="UTM sources" icon={Tag} items={stats?.utmSources ?? []} color="teal" />
            <BarList title="UTM campaigns" icon={Tag} items={stats?.utmCampaigns ?? []} color="grape" />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="tech">
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <BarList title="Browsers" icon={AppWindow} items={stats?.browsers ?? []} color="cyan" />
            <BarList title="Operating systems" icon={MonitorSmartphone} items={stats?.operatingSystems ?? []} color="teal" />
            <BarList title="Devices" icon={MonitorSmartphone} items={stats?.devices ?? []} color="emerald" />
            <BarList title="Screen sizes" icon={MonitorSmartphone} items={stats?.screenSizes ?? []} color="grape" />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="geo">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <div style={{ gridColumn: "span 2" }}>
              <WorldMap countries={stats?.countries ?? []} />
            </div>
            <Stack gap="lg">
              <BarList
                title="Countries"
                icon={Globe2}
                items={stats?.countries ?? []}
                color="emerald"
                format={(k) => (
                  <span>
                    <span style={{ marginRight: 6 }}>{countryFlag(k)}</span>
                    {countryLabel(k)}
                  </span>
                )}
              />
              <BarList title="Languages" icon={Languages} items={stats?.languages ?? []} color="cyan" />
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="clicks">
          <ClicksPanel clicks={stats?.clicks ?? []} total={stats?.clickCount ?? 0} limit={15} />
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
