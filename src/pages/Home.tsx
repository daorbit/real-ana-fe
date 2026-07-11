import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Stack, Badge, Center,
} from "@mantine/core";
import { Users, Eye, Radio, Globe, BarChart3, FolderKanban } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { useWorkspace } from "../workspace";
import type { Stats, Site } from "../types";

function KpiCard({ icon: Icon, label, value, live }: { icon: any; label: string; value: number; live?: boolean }) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between">
        <ThemeIcon variant="light" color={live ? "green" : "indigo"} size="lg" radius="md"><Icon size={18} /></ThemeIcon>
        {live && <Badge color="green" variant="dot">live</Badge>}
      </Group>
      <Text fw={750} fz={30} mt="sm" lh={1} c={live ? "green" : undefined}>{value.toLocaleString()}</Text>
      <Text c="dimmed" size="sm" mt={4}>{label}</Text>
    </Card>
  );
}

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
    { icon: Users, label: "Visitors (24h)", value: stats?.visitors ?? 0 },
    { icon: Eye, label: "Pageviews (24h)", value: stats?.pageviews ?? 0 },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, live: true },
    { icon: Globe, label: "Sites", value: sites.length },
  ];

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={4}>Overview for <b>{active.name}</b> — last 24 hours.</Text>
        </div>
        <Button component={Link} to="/app/analytics" leftSection={<BarChart3 size={16} />}>Full analytics</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
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
