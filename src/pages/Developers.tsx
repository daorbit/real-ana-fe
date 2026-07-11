import { useEffect, useState } from "react";
import {
  Title, Text, Group, Button, Card, Table, ActionIcon, Alert, Code, CopyButton,
  Tabs, TextInput, Stack, Badge, Center, ThemeIcon, ScrollArea,
} from "@mantine/core";
import { KeyRound, Plus, Trash2, Copy, Check, Code2, BookOpen, Terminal } from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { useWorkspace } from "../workspace";
import type { ApiKey } from "../types";

function KeysTab() {
  const { active } = useWorkspace();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!active) return;
    api.get<ApiKey[]>(`/api/workspaces/${active._id}/keys`).then(setKeys).catch((e) => setError(e.message));
  };
  useEffect(load, [active]);

  const create = async () => {
    if (!active) return;
    setCreating(true); setError(null);
    try {
      const k = await api.post<ApiKey>(`/api/workspaces/${active._id}/keys`, { name: name || "Default key" });
      setJustCreated(k);
      setName("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (k: ApiKey) => {
    if (!active) return;
    if (!confirm(`Revoke key "${k.name}"? Any integration using it will stop working.`)) return;
    await api.del(`/api/workspaces/${active._id}/keys/${k.id}`);
    load();
  };

  return (
    <Stack gap="lg">
      {error && <Alert color="red" variant="light">{error}</Alert>}

      {justCreated?.key && (
        <Alert color="green" variant="light" icon={<Check size={16} />} title="API key created — copy it now">
          <Text size="sm" mb="xs">This secret is shown only once. Store it securely.</Text>
          <Group gap="xs" wrap="nowrap">
            <Code style={{ flex: 1, overflow: "auto" }}>{justCreated.key}</Code>
            <CopyButton value={justCreated.key}>
              {({ copied, copy }) => (
                <Button size="xs" variant="light" color={copied ? "green" : "violet"} onClick={copy} leftSection={copied ? <Check size={13} /> : <Copy size={13} />}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Alert>
      )}

      <Card withBorder radius="lg" padding="md">
        <Group align="flex-end">
          <TextInput label="New API key name" placeholder="e.g. Production" value={name} onChange={(e) => setName(e.currentTarget.value)} style={{ flex: 1 }} />
          <Button leftSection={<Plus size={16} />} onClick={create} loading={creating}>Create key</Button>
        </Group>
      </Card>

      {keys.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" size="xl" radius="md"><KeyRound size={22} /></ThemeIcon>
            <Text c="dimmed" size="sm">No API keys yet. Create one to start integrating.</Text>
          </Stack>
        </Center>
      ) : (
        <Card withBorder radius="lg" padding={0}>
          <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead>
              <Table.Tr><Table.Th>Name</Table.Th><Table.Th>Key</Table.Th><Table.Th>Last used</Table.Th><Table.Th ta="right">Actions</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {keys.map((k) => (
                <Table.Tr key={k.id}>
                  <Table.Td fw={600}>{k.name}</Table.Td>
                  <Table.Td><Code>{k.prefix}••••••••</Code></Table.Td>
                  <Table.Td c="dimmed">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "never"}</Table.Td>
                  <Table.Td ta="right">
                    <ActionIcon variant="subtle" color="red" onClick={() => revoke(k)} title="Revoke"><Trash2 size={15} /></ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const color = method === "GET" ? "blue" : method === "POST" ? "green" : method === "DELETE" ? "red" : "gray";
  return (
    <Group gap="sm" wrap="nowrap" py={6}>
      <Badge color={color} variant="light" w={64} style={{ flexShrink: 0 }}>{method}</Badge>
      <Code style={{ flexShrink: 0 }}>{path}</Code>
      <Text size="sm" c="dimmed" truncate>{desc}</Text>
    </Group>
  );
}

function DocsTab() {
  const base = API_ORIGIN;
  const curlCreate = `curl -X POST ${base}/v1/projects \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "User App", "extUserId": "user_123" }'`;

  const curlSite = `curl -X POST ${base}/v1/projects/PROJECT_ID/sites \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Prod", "domain": "app.com", "framework": "react" }'
# -> returns { site, snippet }`;

  const snippet = `<script async
  src="${base}/tracker.js"
  data-site="SITE_ID"></script>`;

  const curlStats = `curl ${base}/v1/sites/SITE_ID/stats?range=24h \\
  -H "Authorization: Bearer sk_live_..."`;

  return (
    <Stack gap="lg">
      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="sm"><BookOpen size={18} /><Title order={4}>How it works</Title></Group>
        <Text size="sm" c="dimmed">
          Give your end-users real-time analytics inside your own product. Create a <b>project</b> per
          user's app, add a <b>site</b> to get a tracking snippet, inject it into their generated app,
          then read stats back through the API and render them in your UI.
        </Text>
      </Card>

      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="sm"><Code2 size={18} /><Title order={4}>Endpoints</Title></Group>
        <ScrollArea>
          <Endpoint method="POST" path="/v1/projects" desc="Create a project for an end-user" />
          <Endpoint method="GET" path="/v1/projects" desc="List projects (?extUserId= to filter)" />
          <Endpoint method="POST" path="/v1/projects/:pid/sites" desc="Create a site, returns snippet" />
          <Endpoint method="GET" path="/v1/projects/:pid/sites" desc="List sites in a project" />
          <Endpoint method="GET" path="/v1/sites/:siteId/stats" desc="Aggregated stats (?range=24h)" />
          <Endpoint method="GET" path="/v1/sites/:siteId/snippet" desc="Get the tracking snippet" />
          <Endpoint method="DELETE" path="/v1/sites/:siteId" desc="Delete a site + its events" />
        </ScrollArea>
      </Card>

      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="md"><Terminal size={18} /><Title order={4}>Quick start</Title></Group>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={600} mb={6}>1. Create a project</Text>
            <Code block>{curlCreate}</Code>
          </div>
          <div>
            <Text size="sm" fw={600} mb={6}>2. Create a site (returns snippet)</Text>
            <Code block>{curlSite}</Code>
          </div>
          <div>
            <Text size="sm" fw={600} mb={6}>3. Inject the snippet into the user's app</Text>
            <Code block>{snippet}</Code>
          </div>
          <div>
            <Text size="sm" fw={600} mb={6}>4. Read stats and render in your UI</Text>
            <Code block>{curlStats}</Code>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}

export default function Developers() {
  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <Title order={1}>Developers</Title>
        <Text c="dimmed" size="sm" mt={6}>
          Integrate Vantage analytics into your platform via the API.
        </Text>
      </div>

      <Tabs defaultValue="keys" variant="outline">
        <Tabs.List mb="lg">
          <Tabs.Tab value="keys" leftSection={<KeyRound size={15} />}>API Keys</Tabs.Tab>
          <Tabs.Tab value="docs" leftSection={<BookOpen size={15} />}>Documentation</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="keys"><KeysTab /></Tabs.Panel>
        <Tabs.Panel value="docs"><DocsTab /></Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
