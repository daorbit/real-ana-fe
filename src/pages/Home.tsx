import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Center, Badge,
  Progress, Drawer, Switch, Divider, Anchor,
} from "@mantine/core";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import {
  Users, Eye, Radio, Globe, BarChart3, FolderKanban, Plus, ArrowUpRight,
  MousePointerClick, Timer, Layers, Globe2, SlidersHorizontal, RotateCcw,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { AnalyticsArt } from "../components/Brand";
import { RefreshButton } from "../components/Refresh";
import { useStats, useSites, useHomeWidgets, WIDGETS } from "../hooks";
import type { WidgetId } from "../hooks";
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
  const { enabled, has, toggle, reset } = useHomeWidgets();
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
  const hasData = (stats?.pageviews ?? 0) > 0;

  // Every metric card, keyed by widget id. Only the enabled ones get rendered.
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

  const metricIds = WIDGETS.filter((w) => w.group === "Metrics" && has(w.id)).map((w) => w.id);
  const showTraffic = has("traffic");
  const showLivePages = has("livePages");
  const panels = (["topPages", "topReferrers", "topCountries"] as WidgetId[]).filter(has);

  const grouped = ["Metrics", "Panels"] as const;

  return (
    <AppShell>
      {/* Customize drawer */}
      <Drawer
        opened={customizing}
        onClose={() => setCustomizing(false)}
        title="Customize your home page"
        position="right"
        radius="lg"
      >
        <Text size="sm" c="dimmed" mb="lg">
          Pick what you want to see at a glance. The full breakdown always lives in{" "}
          <Anchor component={Link} to="/app/analytics" size="sm">Analytics</Anchor>.
        </Text>

        <Stack gap="lg">
          {grouped.map((group) => (
            <div key={group}>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" style={{ letterSpacing: "0.05em" }}>
                {group}
              </Text>
              <Stack gap="xs">
                {WIDGETS.filter((w) => w.group === group).map((w) => (
                  <Switch
                    key={w.id}
                    label={w.label}
                    checked={has(w.id)}
                    onChange={() => toggle(w.id)}
                    size="sm"
                  />
                ))}
              </Stack>
            </div>
          ))}
        </Stack>

        <Divider my="lg" />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">{enabled.length} widget{enabled.length === 1 ? "" : "s"} shown</Text>
          <Button variant="subtle" size="xs" leftSection={<RotateCcw size={13} />} onClick={reset}>
            Reset to default
          </Button>
        </Group>
      </Drawer>

      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>
            A quick look at <b>{active.name}</b> — last 24 hours.
          </Text>
        </div>
        <Group gap="sm">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <Button
            variant="default"
            leftSection={<SlidersHorizontal size={15} />}
            onClick={() => setCustomizing(true)}
          >
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
            <Text c="dimmed" size="xs">Choose the widgets you want to see.</Text>
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

          {(showTraffic || showLivePages) && (
            <SimpleGrid cols={{ base: 1, lg: showTraffic && showLivePages ? 3 : 1 }} spacing="lg" mb="lg">
              {showTraffic && (
                <motion.div
                  style={showLivePages ? { gridColumn: "span 2" } : undefined}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                >
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
                </motion.div>
              )}

              {showLivePages && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }}>
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
              )}
            </SimpleGrid>
          )}

          {panels.length > 0 && (
            <SimpleGrid cols={{ base: 1, md: Math.min(3, panels.length) }} spacing="lg">
              {panels.includes("topPages") && (
                <MiniList title="Top pages" icon={Eye} items={stats?.topPages ?? []} empty="No pageviews yet" />
              )}
              {panels.includes("topReferrers") && (
                <MiniList title="Top referrers" icon={ArrowUpRight} items={stats?.topReferrers ?? []} empty="No referrers yet" />
              )}
              {panels.includes("topCountries") && (
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
              )}
            </SimpleGrid>
          )}
        </>
      )}
    </AppShell>
  );
}
