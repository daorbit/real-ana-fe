import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Center, Badge, Progress,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid,
} from "recharts";
import {
  Users, Eye, Radio, Globe, BarChart3, FolderKanban, Plus, ArrowUpRight,
  MousePointerClick, Timer, Layers, Globe2,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { AnalyticsArt } from "../components/Brand";
import { RefreshButton } from "../components/Refresh";
import { useStats, useSites } from "../hooks";
import { countryFlag, countryLabel, duration, num } from "../utils";
import { useWorkspace } from "../workspace";
import type { Bucket } from "../types";

/** Compact ranked list used for the Home mini-panels. */
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

export default function Home() {
  const { active, loading } = useWorkspace();
  const { stats, refresh, refreshing, lastUpdated } = useStats(active?._id, "24h");
  const { sites } = useSites(active?._id);

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
  const hasData = (stats?.pageviews ?? 0) > 0;

  const kpis = [
    { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors" },
    { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views" },
    { icon: MousePointerClick, label: "Bounce rate", value: `${stats?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true },
    { icon: Timer, label: "Avg. session", value: duration(stats?.avgSessionMs ?? 0), color: "amber", delta: d?.avgSessionMs ?? null },
  ];

  const secondary = [
    { icon: Layers, label: "Sessions", value: stats?.sessions ?? 0, color: "cyan", delta: d?.sessions ?? null },
    { icon: Layers, label: "Pages / session", value: stats?.pagesPerSession ?? 0, color: "emerald", delta: d?.pagesPerSession ?? null },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
    { icon: Globe, label: "Sites", value: sites.length, color: "amber" },
  ];

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Overview for <b>{active.name}</b> — last 24 hours, compared to the 24 hours before.
          </Text>
        </div>
        <Group gap="sm">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <Button component={Link} to="/app/analytics" leftSection={<BarChart3 size={16} />}>Full analytics</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {secondary.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      {/* traffic + live */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.35 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm" c="dimmed">Traffic — last 24h</Text>
              <Button component={Link} to="/app/analytics" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>Details</Button>
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
                  Install the tracking snippet on a site and live visitors will appear here in real time.
                </Text>
                <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6} leftSection={<Plus size={14} />}>
                  Get tracking snippet
                </Button>
              </Stack>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.35 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Group gap={8}>
                <span className="status-dot live" style={{ background: "var(--mantine-color-teal-6)" }} />
                <Text fw={600} c="dimmed" size="sm">Right now</Text>
              </Group>
              <Badge variant="light" color="teal" size="sm">{stats?.live ?? 0}</Badge>
            </Group>
            {(stats?.livePages ?? []).length === 0 ? (
              <Center py="xl">
                <Text c="dimmed" size="xs" ta="center">Nobody on the site in the last 5 minutes</Text>
              </Center>
            ) : (
              <Stack gap="xs">
                {stats!.livePages.map((p) => (
                  <Group key={p.key} justify="space-between" gap="xs" wrap="nowrap">
                    <Text size="sm" truncate style={{ flex: 1 }}>{p.key}</Text>
                    <Badge variant="light" color="gray" size="sm">{p.count}</Badge>
                  </Group>
                ))}
              </Stack>
            )}
          </Card>
        </motion.div>
      </SimpleGrid>

      {/* mini breakdowns */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <MiniList title="Top pages" icon={Eye} items={stats?.topPages ?? []} empty="No pageviews yet" />
        <MiniList title="Top referrers" icon={ArrowUpRight} items={stats?.topReferrers ?? []} empty="No referrers yet" />
        <MiniList
          title="Top countries"
          icon={Globe2}
          items={stats?.countries ?? []}
          empty="No location data yet"
          format={(k) => (
            <span>
              <span style={{ marginRight: 6 }}>{countryFlag(k)}</span>
              {countryLabel(k)}
            </span>
          )}
        />
      </SimpleGrid>
    </AppShell>
  );
}
