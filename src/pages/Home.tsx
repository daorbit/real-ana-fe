import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Center,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Users, Eye, Radio, Globe, BarChart3, FolderKanban, Plus, ArrowUpRight,
} from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { AnalyticsArt } from "../components/Brand";
import { useWorkspace } from "../workspace";
import type { Stats, Site } from "../types";

export default function Home() {
  const { active, loading } = useWorkspace();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    if (!active) { setStats(null); setSites([]); return; }
    const load = () => {
      api.get<Stats>(`/api/workspaces/${active._id}/stats?range=24h`).then(setStats).catch(() => setStats(null));
      api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => setSites([]));
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [active]);

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

  const kpis = [
    { icon: Users, label: "Visitors (24h)", value: stats?.visitors ?? 0, color: "violet" },
    { icon: Eye, label: "Pageviews (24h)", value: stats?.pageviews ?? 0, color: "cyan" },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
    { icon: Globe, label: "Sites", value: sites.length, color: "amber" },
  ];

  const series = stats?.timeseries ?? [];
  const hasData = (stats?.pageviews ?? 0) > 0;

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>Overview for <b>{active.name}</b> — last 24 hours.</Text>
        </div>
        <Button component={Link} to="/app/analytics" variant="gradient" gradient={{ from: "violet.5", to: "violet.7", deg: 135 }} leftSection={<BarChart3 size={16} />}>Full analytics</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}>
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
                      <stop offset="0%" stopColor="#8f6bee" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hs" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a88ff1" /><stop offset="100%" stopColor="#6d5cff" />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "var(--muted)" }} />
                  <Area type="monotone" dataKey="views" stroke="url(#hs)" strokeWidth={2.5} fill="url(#hg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Stack align="center" gap="xs" py="md">
                <AnalyticsArt />
                <Text fw={600} size="sm" mt="sm">No traffic yet</Text>
                <Text c="dimmed" size="xs" ta="center" maw={340}>
                  Install the tracking snippet on a site and live visitors will appear here in real time.
                </Text>
                <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6} leftSection={<Plus size={14} />}>Get tracking snippet</Button>
              </Stack>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <Text fw={600} size="sm" c="dimmed" mb="md">Quick actions</Text>
            <Stack gap="sm">
              <Button component={Link} to="/app/workspaces" variant="light" color="violet" fullWidth justify="flex-start" leftSection={<Plus size={16} />}>Add a site</Button>
              <Button component={Link} to="/app/analytics" variant="light" color="cyan" fullWidth justify="flex-start" leftSection={<BarChart3 size={16} />}>View analytics</Button>
              <Button component={Link} to="/app/workspaces" variant="light" color="grape" fullWidth justify="flex-start" leftSection={<FolderKanban size={16} />}>Manage workspaces</Button>
            </Stack>
          </Card>
        </motion.div>
      </SimpleGrid>
    </AppShell>
  );
}
