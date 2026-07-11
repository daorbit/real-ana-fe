import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon, Badge, Progress,
  SegmentedControl, Table, TextInput, Select, Stack, Center, ActionIcon, CopyButton, Code, Alert, Collapse,
} from "@mantine/core";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Users, Eye, Radio, Plus, Copy, Check, Trash2, FolderKanban } from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { FrameworkIcon } from "../components/Brand";
import { useWorkspace } from "../workspace";
import type { Stats, Site, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];
const CHART = "#4f46e5";
const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"];

function BarList({ title, items }: { title: string; items: Bucket[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} c="dimmed" size="sm" mb="md">{title}</Text>
      {items.length === 0 && <Text c="dimmed" size="sm">No data yet</Text>}
      <Stack gap="xs">
        {items.map((i) => (
          <div key={i.key}>
            <Group justify="space-between" gap="xs" mb={3} wrap="nowrap">
              <Text size="sm" truncate style={{ flex: 1 }}>{i.key}</Text>
              <Text size="sm" fw={700}>{i.count}</Text>
            </Group>
            <Progress value={(i.count / max) * 100} size="sm" radius="sm" color="indigo" />
          </div>
        ))}
      </Stack>
    </Card>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Card withBorder shadow="sm" padding="xs" radius="sm">
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={700}>{payload[0].value} views</Text>
    </Card>
  );
}

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
    { icon: Users, label: "Visitors", value: stats?.visitors ?? 0 },
    { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0 },
    { icon: Radio, label: "Live now", value: stats?.live ?? 0, live: true },
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
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg" mb="lg">
        <Text fw={600} c="dimmed" size="sm" mb="md">Pageviews over time</Text>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={stats?.timeseries ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaecf0" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#98a2b3" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#98a2b3" }} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTip />} cursor={{ stroke: CHART, strokeWidth: 1 }} />
            <Area type="monotone" dataKey="views" stroke={CHART} strokeWidth={2.5} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <BarList title="Top Pages" items={stats?.topPages ?? []} />
        <BarList title="Top Referrers" items={stats?.topReferrers ?? []} />
        <BarList title="Devices" items={stats?.devices ?? []} />
        <BarList title="Countries" items={stats?.countries ?? []} />
        <BarList title="UTM Sources" items={stats?.utmSources ?? []} />
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
