import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Center,
} from "@mantine/core";
import { Users, Eye, Radio, Globe, BarChart3, FolderKanban } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { useWorkspace } from "../workspace";
import type { Stats, Site } from "../types";

export default function Home() {
  const { active, loading } = useWorkspace();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    if (!active) { setStats(null); setSites([]); return; }
    api.get<Stats>(`/api/workspaces/${active._id}/stats?range=24h`).then(setStats).catch(() => setStats(null));
    api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => setSites([]));
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

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>Overview for <b>{active.name}</b> — last 24 hours.</Text>
        </div>
        <Button component={Link} to="/app/analytics" leftSection={<BarChart3 size={16} />}>Full analytics</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {kpis.map((k) => <StatCard key={k.label} {...k} />)}
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} c="dimmed" size="sm" mb="md">Your sites</Text>
        {sites.length === 0 ? (
          <Text c="dimmed" size="sm">No sites in this workspace. <Link to="/app/analytics">Add one</Link>.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {sites.map((s) => (
              <Card key={s._id} withBorder radius="md" padding="md" component={Link} to="/app/analytics">
                <Text fw={600}>{s.name}</Text>
                <Text c="dimmed" size="sm">{s.domain}</Text>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>
    </AppShell>
  );
}
