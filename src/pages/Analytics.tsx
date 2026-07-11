import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Title, Text, Group, Button, SimpleGrid, Card, Badge, Progress,
  SegmentedControl, Table, TextInput, Select, Stack, Center, ActionIcon, CopyButton, Code, Alert, Collapse, ThemeIcon,
} from "@mantine/core";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Users, Eye, Radio, Plus, Copy, Check, Trash2, FolderKanban, Inbox } from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { FrameworkIcon, AnalyticsArt } from "../components/Brand";
import { StatCard } from "../components/StatCard";
import { useWorkspace } from "../workspace";
import type { Stats, Site, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];
const CHART = "#7c5cff";
const BAR_COLORS = ["indigo", "teal", "cyan", "grape", "yellow"];
const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"];

function BarList({ title, items, color = "indigo" }: { title: string; items: Bucket[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="lg" padding="lg">
      <Text fw={600} c="dimmed" size="sm" mb="md">{title}</Text>
      {items.length === 0 ? (
        <Center py="lg">
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">Waiting for data…</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {items.map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Text size="sm" truncate style={{ flex: 1 }}>{i.key}</Text>
                <Text size="sm" fw={700}>{i.count}</Text>
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
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={700}>{payload[0].value} views</Text>
    </Card>
  );
}

export default function Analytics() {
  const { active, loading } = useWorkspace();
  const [range, setRange] = useState("24h");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState("react");
  const [created, setCreated] = useState<Site | null>(null);

  const loadStats = useCallback(() => {
    if (!active) return;
    api.get<Stats>(`/api/workspaces/${active._id}/stats?range=${range}`)
      .then((s) => { setStats(s); setError(null); })
      .catch((e) => setError(e.message));
  }, [active, range]);

  const loadSites = useCallback(() => {
    if (!active) return;
    api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => {});
  }, [active]);

  useEffect(() => {
    loadStats();
    loadSites();
    const id = setInterval(loadStats, 3000);
    return () => clearInterval(id);
  }, [loadStats, loadSites]);

  const addSite = async (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    try {
      const site = await api.post<Site>(`/api/workspaces/${active._id}/sites`, { name, domain, framework });
      setName(""); setDomain(""); setAddOpen(false);
      setCreated(site);
      loadSites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const delSite = async (s: Site) => {
    if (!active) return;
    if (!confirm(`Delete site "${s.name}" and its analytics?`)) return;
    await api.del(`/api/workspaces/${active._id}/sites/${s.siteId}`);
    loadSites(); loadStats();
  };

  const snippet = (siteId: string) =>
    `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;

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

  const siteCount = stats?.siteCount ?? sites.length;
  const kpis = [
    { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "violet" },
    { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan" },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
  ];

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2}>Analytics</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Aggregated across {siteCount} site{siteCount === 1 ? "" : "s"} in <b>{active.name}</b>.
          </Text>
        </div>
        <SegmentedControl value={range} onChange={setRange} data={RANGES} size="sm" />
      </Group>

      {error && <Alert color="red" variant="light" mb="md">{error}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}>
            <StatCard {...k} />
          </motion.div>
        ))}
      </SimpleGrid>

      <Card withBorder radius="lg" padding="lg" mb="lg">
        <Text fw={600} c="dimmed" size="sm" mb="md">Pageviews over time</Text>
        {(stats?.pageviews ?? 0) > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.timeseries ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8f6bee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a88ff1" />
                  <stop offset="100%" stopColor="#6d5cff" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: CHART, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="views" stroke="url(#stroke)" strokeWidth={3} fill="url(#g)" dot={false} activeDot={{ r: 5, fill: "#a88ff1" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Center h={250}>
            <Stack align="center" gap={6}>
              <AnalyticsArt />
              <Text fw={600} size="sm" mt="xs">No pageviews yet</Text>
              <Text c="dimmed" size="xs" ta="center" maw={320}>
                Add the tracking snippet to a site below. Live traffic will stream in here automatically.
              </Text>
            </Stack>
          </Center>
        )}
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <BarList title="Top Pages" items={stats?.topPages ?? []} color={BAR_COLORS[0]} />
        <BarList title="Top Referrers" items={stats?.topReferrers ?? []} color={BAR_COLORS[1]} />
        <BarList title="Devices" items={stats?.devices ?? []} color={BAR_COLORS[2]} />
        <BarList title="Countries" items={stats?.countries ?? []} color={BAR_COLORS[3]} />
        <BarList title="UTM Sources" items={stats?.utmSources ?? []} color={BAR_COLORS[4]} />
      </SimpleGrid>

      {/* Sites management */}
      <Group justify="space-between" align="center" mt={40} mb="md">
        <Title order={3}>Sites in this workspace</Title>
        <Button variant={addOpen ? "light" : "filled"} leftSection={<Plus size={16} />} onClick={() => setAddOpen((v) => !v)}>Add site</Button>
      </Group>

      <Collapse expanded={addOpen}>
        <Card withBorder radius="md" padding="md" mb="md">
          <form onSubmit={addSite}>
            <Group align="flex-end">
              <TextInput label="Site name" placeholder="My App" value={name} onChange={(e) => setName(e.currentTarget.value)} required style={{ flex: 1 }} />
              <TextInput label="Domain" placeholder="domain.com" value={domain} onChange={(e) => setDomain(e.currentTarget.value)} required style={{ flex: 1 }} />
              <Select label="Framework" data={FRAMEWORKS} value={framework} onChange={(v) => v && setFramework(v)} w={140} comboboxProps={{ withinPortal: true }} />
              <Button type="submit">Create</Button>
            </Group>
          </form>
        </Card>
      </Collapse>

      {created && (
        <Alert color="green" variant="light" icon={<Check size={16} />} mb="md" title={`${created.name} created`}>
          <Text size="sm" mb="xs">Paste this before <Code>&lt;/head&gt;</Code> in your app:</Text>
          <Group gap="xs" wrap="nowrap">
            <Code style={{ flex: 1, overflow: "auto" }}>{snippet(created.siteId)}</Code>
            <CopyButton value={snippet(created.siteId)}>
              {({ copied, copy }) => (
                <Button size="xs" variant="light" color={copied ? "green" : "indigo"} onClick={copy} leftSection={copied ? <Check size={13} /> : <Copy size={13} />}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Alert>
      )}

      {sites.length === 0 ? (
        <Card withBorder radius="md" padding="xl">
          <Text c="dimmed" ta="center">No sites yet. Add one to start collecting analytics.</Text>
        </Card>
      ) : (
        <Card withBorder radius="md" padding={0}>
          <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th><Table.Th>Domain</Table.Th><Table.Th>Framework</Table.Th>
                <Table.Th>Snippet</Table.Th><Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sites.map((s) => (
                <Table.Tr key={s._id}>
                  <Table.Td fw={600}>{s.name}</Table.Td>
                  <Table.Td c="dimmed">{s.domain}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" leftSection={<FrameworkIcon name={s.framework} />} tt="capitalize">{s.framework}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <CopyButton value={snippet(s.siteId)}>
                      {({ copied, copy }) => (
                        <Button size="xs" variant="default" onClick={copy} leftSection={copied ? <Check size={13} /> : <Copy size={13} />}>
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      )}
                    </CopyButton>
                  </Table.Td>
                  <Table.Td ta="right">
                    <ActionIcon variant="subtle" color="red" onClick={() => delSite(s)} title="Delete"><Trash2 size={15} /></ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </AppShell>
  );
}
