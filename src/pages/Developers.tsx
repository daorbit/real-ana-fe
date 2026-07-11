import { useEffect, useState } from "react";
import {
  Title, Text, Group, Button, Card, ActionIcon, Alert, Code, CopyButton, Modal,
  Tabs, TextInput, Stack, Badge, Center, ThemeIcon, List, Divider, Anchor, Table,
  SimpleGrid, Tooltip,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  KeyRound, Plus, Trash2, Copy, Check, BookOpen, Terminal, Boxes, Globe,
  ShieldCheck, ArrowRight, AlertTriangle, Rocket, Blocks, Braces,
} from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { CodeTabs } from "../components/CodeTabs";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import type { ApiKey } from "../types";

/* ------------------------------- API keys ------------------------------- */

function KeysTab() {
  const { active } = useWorkspace();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);

  const load = () => {
    if (!active) return;
    api.get<ApiKey[]>(`/api/workspaces/${active._id}/keys`)
      .then(setKeys)
      .catch((e) => notify.error(errMessage(e, "Could not load API keys.")));
  };
  useEffect(load, [active]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    setCreating(true);
    try {
      const k = await api.post<ApiKey>(`/api/workspaces/${active._id}/keys`, { name: name || "Default key" });
      setJustCreated(k);
      setName("");
      setModal(false);
      load();
      notify.success("API key created. Copy it now — it won't be shown again.");
    } catch (e2) {
      notify.error(errMessage(e2, "Could not create the API key."));
    } finally {
      setCreating(false);
    }
  };

  const revoke = (k: ApiKey) => {
    if (!active) return;
    confirmDelete({
      title: `Revoke "${k.name}"?`,
      body: "Any integration still using this key will immediately start receiving 401 Unauthorized. This cannot be undone.",
      confirmLabel: "Revoke key",
      onConfirm: async () => {
        try {
          await api.del(`/api/workspaces/${active._id}/keys/${k.id}`);
          load();
          notify.success(`Key "${k.name}" revoked.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not revoke the key."));
        }
      },
    });
  };

  return (
    <Stack gap="lg">
      <Modal opened={modal} onClose={() => setModal(false)} title="Create API key" centered radius="lg">
        <form onSubmit={create}>
          <Stack gap="md">
            <TextInput
              label="Key name"
              placeholder="e.g. Production backend"
              description="A label so you can tell your keys apart. Only you see it."
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              data-autofocus
            />
            <Alert color="yellow" variant="light" p="xs" icon={<ShieldCheck size={14} />}>
              <Text size="xs">The secret is shown once. Store it in an environment variable on your server.</Text>
            </Alert>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
              <Button type="submit" loading={creating}>Create key</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Secret reveal modal — the only time the raw key is ever shown */}
      <Modal
        opened={!!justCreated?.key}
        onClose={() => setJustCreated(null)}
        title="Your new API key"
        centered
        radius="lg"
        size="lg"
        closeOnClickOutside={false}
      >
        {justCreated?.key && (
          <Stack gap="md">
            <Alert color="yellow" variant="light" p="xs" icon={<AlertTriangle size={14} />}>
              <Text size="xs">
                This is the only time we show this secret. We store a hash, so we cannot recover it later.
                Copy it into your server's environment variables now.
              </Text>
            </Alert>

            <Card withBorder radius="md" padding="sm" bg="var(--surface-2)">
              <Code block style={{ background: "transparent" }}>{justCreated.key}</Code>
            </Card>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setJustCreated(null)}>Done</Button>
              <CopyButton value={justCreated.key}>
                {({ copied, copy }) => (
                  <Button onClick={copy} leftSection={copied ? <Check size={15} /> : <Copy size={15} />}>
                    {copied ? "Copied" : "Copy key"}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>

      <Group justify="space-between" align="center">
        <div>
          <Text fw={650}>Your API keys</Text>
          <Text size="sm" c="dimmed">Server-side secrets scoped to this workspace.</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setModal(true)}>Create key</Button>
      </Group>

      {keys.length === 0 ? (
        <Card withBorder radius="lg" padding="xl">
          <Center>
            <Stack align="center" gap={8}>
              <ThemeIcon variant="light" color="emerald" size={52} radius="xl"><KeyRound size={24} /></ThemeIcon>
              <Text fw={600} size="sm">No API keys yet</Text>
              <Text c="dimmed" size="xs" ta="center" maw={320}>
                Create a key to start creating projects and sites for your users from your own backend.
              </Text>
              <Button size="xs" variant="light" mt={4} leftSection={<Plus size={14} />} onClick={() => setModal(true)}>Create your first key</Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {keys.map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card withBorder radius="lg" padding="lg">
                <Group justify="space-between" align="flex-start" mb="sm">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="emerald" radius="md" size="lg"><KeyRound size={17} /></ThemeIcon>
                    <div>
                      <Text fw={650} size="sm">{k.name}</Text>
                      <Text size="xs" c="dimmed">
                        {k.lastUsedAt ? `Last used ${new Date(k.lastUsedAt).toLocaleString()}` : "Never used"}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label="Revoke" withArrow>
                    <ActionIcon variant="subtle" color="red" onClick={() => revoke(k)}><Trash2 size={15} /></ActionIcon>
                  </Tooltip>
                </Group>
                <Code block>{k.prefix}••••••••••••••••••••</Code>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

/* --------------------------------- Docs --------------------------------- */

function Method({ m }: { m: string }) {
  const color = m === "GET" ? "blue" : m === "POST" ? "teal" : m === "DELETE" ? "red" : "gray";
  return <Badge color={color} variant="light" w={62} style={{ flexShrink: 0 }}>{m}</Badge>;
}

const ENDPOINTS = [
  { m: "POST", p: "/v1/projects", d: "Create a project. One project = one end-user's app. Pass your own user id as extUserId so you can look it up later." },
  { m: "GET", p: "/v1/projects", d: "List projects in the workspace. Filter to one end-user with ?extUserId=user_123." },
  { m: "POST", p: "/v1/projects/:pid/sites", d: "Create a tracked site inside a project. The response includes a ready-to-inject snippet." },
  { m: "GET", p: "/v1/projects/:pid/sites", d: "List every site belonging to a project (e.g. staging and production)." },
  { m: "GET", p: "/v1/sites/:siteId/stats", d: "Aggregated analytics for one site. Optional ?range=1h|24h|7d|30d (default 24h)." },
  { m: "GET", p: "/v1/sites/:siteId/snippet", d: "Fetch the tracking snippet again for an existing site." },
  { m: "DELETE", p: "/v1/sites/:siteId", d: "Permanently delete a site and every event collected for it." },
];

function Step({ n, title, desc, children }: { n: number; title: string; desc: React.ReactNode; children: React.ReactNode }) {
  return (
    <Group align="flex-start" gap="md" wrap="nowrap">
      <div className="step-num">{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text fw={650} size="sm">{title}</Text>
        <Text size="xs" c="dimmed" mb="sm" mt={2}>{desc}</Text>
        {children}
      </div>
    </Group>
  );
}

function DocsTab() {
  const base = API_ORIGIN;

  const authSnips = {
    cURL: `curl ${base}/v1/projects \\
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxx"`,
    "Node.js": `const VANTAGE_KEY = process.env.VANTAGE_API_KEY; // never hard-code

const res = await fetch("${base}/v1/projects", {
  headers: { Authorization: \`Bearer \${VANTAGE_KEY}\` },
});
const projects = await res.json();`,
    Python: `import os, requests

VANTAGE_KEY = os.environ["VANTAGE_API_KEY"]

res = requests.get(
    "${base}/v1/projects",
    headers={"Authorization": f"Bearer {VANTAGE_KEY}"},
)
projects = res.json()`,
    PHP: `<?php
$key = getenv('VANTAGE_API_KEY');

$ch = curl_init('${base}/v1/projects');
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $key"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$projects = json_decode(curl_exec($ch), true);`,
  };

  const projectSnips = {
    cURL: `curl -X POST ${base}/v1/projects \\
  -H "Authorization: Bearer $VANTAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Jane Portfolio", "extUserId": "user_123" }'

# 201 Created
# { "_id": "65f...", "name": "Jane Portfolio", "extUserId": "user_123" }`,
    "Node.js": `// Call this when a user creates a new app on your platform.
async function createProject(endUserId, appName) {
  const res = await fetch("${base}/v1/projects", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.VANTAGE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: appName, extUserId: endUserId }),
  });
  if (!res.ok) throw new Error(\`Vantage: \${res.status}\`);
  return res.json(); // { _id, name, extUserId, ... }
}`,
    Python: `import os, requests

def create_project(end_user_id: str, app_name: str) -> dict:
    """Call when a user creates a new app on your platform."""
    res = requests.post(
        "${base}/v1/projects",
        headers={
            "Authorization": f"Bearer {os.environ['VANTAGE_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={"name": app_name, "extUserId": end_user_id},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()`,
    PHP: `<?php
function create_project(string $endUserId, string $appName): array {
    $ch = curl_init('${base}/v1/projects');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . getenv('VANTAGE_API_KEY'),
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'name' => $appName,
            'extUserId' => $endUserId,
        ]),
        CURLOPT_RETURNTRANSFER => true,
    ]);
    return json_decode(curl_exec($ch), true);
}`,
  };

  const siteSnips = {
    cURL: `curl -X POST ${base}/v1/projects/PROJECT_ID/sites \\
  -H "Authorization: Bearer $VANTAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Production", "domain": "jane.yourplatform.app", "framework": "react" }'

# 201 Created
# {
#   "site":    { "siteId": "aB3xY9...", "name": "Production", ... },
#   "snippet": "<script async src=... data-site=\\"aB3xY9...\\"></script>"
# }`,
    "Node.js": `// Returns { site, snippet }. Inject \`snippet\` into the app you generate.
async function createSite(projectId, { name, domain, framework }) {
  const res = await fetch(
    \`${base}/v1/projects/\${projectId}/sites\`,
    {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${process.env.VANTAGE_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, domain, framework }),
    }
  );
  const { site, snippet } = await res.json();
  return { siteId: site.siteId, snippet };
}`,
    Python: `def create_site(project_id: str, name: str, domain: str, framework: str = "react"):
    """Returns (site_id, snippet). Inject the snippet into the generated app."""
    res = requests.post(
        f"${base}/v1/projects/{project_id}/sites",
        headers={
            "Authorization": f"Bearer {os.environ['VANTAGE_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={"name": name, "domain": domain, "framework": framework},
        timeout=10,
    )
    res.raise_for_status()
    body = res.json()
    return body["site"]["siteId"], body["snippet"]`,
    PHP: `<?php
function create_site(string $projectId, array $site): array {
    $ch = curl_init("${base}/v1/projects/$projectId/sites");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . getenv('VANTAGE_API_KEY'),
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($site),
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $body = json_decode(curl_exec($ch), true);
    return ['siteId' => $body['site']['siteId'], 'snippet' => $body['snippet']];
}`,
  };

  const injectSnips = {
    HTML: `<!-- Paste the snippet you got back, just before </head> -->
<head>
  <!-- ...the user's app... -->
  <script async
          src="${base}/tracker.js"
          data-site="SITE_ID"></script>
</head>`,
    React: `// Inject into index.html at build time, or mount once at the app root:
useEffect(() => {
  const s = document.createElement("script");
  s.src = "${base}/tracker.js";
  s.async = true;
  s.dataset.site = SITE_ID;      // from the API response
  document.head.appendChild(s);
  return () => { document.head.removeChild(s); };
}, []);`,
    "Next.js": `// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="${base}/tracker.js"
          data-site={process.env.NEXT_PUBLIC_VANTAGE_SITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
    Vue: `// main.ts — mount the tracker once at startup
const s = document.createElement("script");
s.src = "${base}/tracker.js";
s.async = true;
s.dataset.site = import.meta.env.VITE_VANTAGE_SITE_ID;
document.head.appendChild(s);`,
  };

  const statsSnips = {
    cURL: `curl "${base}/v1/sites/SITE_ID/stats?range=24h" \\
  -H "Authorization: Bearer $VANTAGE_API_KEY"

# 200 OK
# {
#   "range": "24h",
#   "visitors": 128, "pageviews": 412, "live": 6,
#   "topPages":     [ { "key": "/",           "count": 210 } ],
#   "topReferrers": [ { "key": "google.com",  "count": 40  } ],
#   "devices":      [ { "key": "desktop",     "count": 300 } ],
#   "countries":    [ { "key": "IN",          "count": 180 } ],
#   "utmSources":   [ { "key": "newsletter",  "count": 22  } ],
#   "timeseries":   [ { "bucket": "09:00",    "views": 31  } ]
# }`,
    "Node.js": `// Your backend fetches stats, then renders them in YOUR dashboard UI.
// Never expose the API key to the browser — proxy through your server.
app.get("/api/my-app/:siteId/stats", requireLogin, async (req, res) => {
  // 1. verify this logged-in user actually owns this siteId in YOUR db
  await assertUserOwnsSite(req.user.id, req.params.siteId);

  // 2. call Vantage server-side
  const r = await fetch(
    \`${base}/v1/sites/\${req.params.siteId}/stats?range=24h\`,
    { headers: { Authorization: \`Bearer \${process.env.VANTAGE_API_KEY}\` } }
  );
  res.json(await r.json());
});`,
    Python: `# Django / Flask view — proxy stats to your own logged-in user.
def my_app_stats(request, site_id):
    assert_user_owns_site(request.user, site_id)   # your own check

    res = requests.get(
        f"${base}/v1/sites/{site_id}/stats",
        params={"range": "24h"},
        headers={"Authorization": f"Bearer {os.environ['VANTAGE_API_KEY']}"},
        timeout=10,
    )
    return JsonResponse(res.json())`,
    PHP: `<?php
// Proxy endpoint in your app — check ownership, then fetch.
function my_app_stats(string $siteId, string $range = '24h'): array {
    assert_user_owns_site(current_user_id(), $siteId);

    $ch = curl_init("${base}/v1/sites/$siteId/stats?range=$range");
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . getenv('VANTAGE_API_KEY')],
        CURLOPT_RETURNTRANSFER => true,
    ]);
    return json_decode(curl_exec($ch), true);
}`,
  };

  return (
    <Stack gap="lg">
      {/* Hero */}
      <Card withBorder radius="lg" padding="xl" className="dev-hero">
        <Group gap="sm" mb="sm">
          <ThemeIcon variant="light" color="emerald" radius="md" size="lg"><Rocket size={18} /></ThemeIcon>
          <Title order={3}>Platform API</Title>
        </Group>
        <Text size="sm" c="dimmed" maw={680} mb="lg">
          Give <b>your users</b> real-time analytics inside <b>your own product</b> — the way Vercel and
          Lovable do. Your users never sign up with Vantage and never see our UI: your backend creates
          the sites, injects the tracker, reads the numbers, and renders them in your design.
        </Text>
        <Group gap="xs" wrap="nowrap" align="center">
          <Badge size="lg" variant="light" color="emerald" leftSection={<Boxes size={12} />}>Workspace</Badge>
          <ArrowRight size={14} opacity={0.35} />
          <Badge size="lg" variant="light" color="cyan" leftSection={<Blocks size={12} />}>Project</Badge>
          <ArrowRight size={14} opacity={0.35} />
          <Badge size="lg" variant="light" color="teal" leftSection={<Globe size={12} />}>Site</Badge>
          <ArrowRight size={14} opacity={0.35} />
          <Badge size="lg" variant="light" color="gray" leftSection={<Braces size={12} />}>Events</Badge>
        </Group>
      </Card>

      {/* Concepts */}
      <Card withBorder radius="lg" padding="lg">
        <Text fw={650} mb="sm">Concepts</Text>
        <List size="sm" spacing="xs" c="dimmed">
          <List.Item><b>Workspace</b> — your organisation. Owns the API key. All data is scoped to it.</List.Item>
          <List.Item><b>Project</b> — one app belonging to one of your end-users. Tag it with your own <Code>extUserId</Code>.</List.Item>
          <List.Item><b>Site</b> — a tracked property inside a project (e.g. production, staging). Has a public <Code>siteId</Code>.</List.Item>
          <List.Item><b>Events</b> — pageviews and custom events sent by the tracker script.</List.Item>
        </List>
      </Card>

      {/* Auth */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="sm"><ShieldCheck size={17} className="sect-ic" /><Text fw={650}>Authentication</Text></Group>
        <Text size="sm" c="dimmed" mb="md">
          Every <Code>/v1</Code> request needs your workspace API key in the <Code>Authorization</Code> header.
          Create one in the <b>API Keys</b> tab. Keys are <b>server-side only</b> — a leaked key exposes every
          site in this workspace. Store it in an environment variable, never in client code or version control.
        </Text>
        <CodeTabs snippets={authSnips} caption={`Base URL: ${base}`} />
        <Alert color="red" variant="light" icon={<AlertTriangle size={14} />} mt="md" p="xs">
          <Text size="xs">A missing, malformed, or revoked key returns <Code>401 Unauthorized</Code>.</Text>
        </Alert>
      </Card>

      {/* Endpoints */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="md"><Globe size={17} className="sect-ic" /><Text fw={650}>Endpoints</Text></Group>
        <Stack gap={0}>
          {ENDPOINTS.map((e, i) => (
            <div key={e.p + e.m}>
              {i > 0 && <Divider />}
              <Group gap="sm" wrap="nowrap" align="flex-start" py="sm">
                <Method m={e.m} />
                <div style={{ minWidth: 0 }}>
                  <Code>{e.p}</Code>
                  <Text size="sm" c="dimmed" mt={4}>{e.d}</Text>
                </div>
              </Group>
            </div>
          ))}
        </Stack>
      </Card>

      {/* Integration guide */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap="xs" mb="lg"><Terminal size={17} className="sect-ic" /><Text fw={650}>Integration guide</Text></Group>
        <Stack gap="xl">
          <Step
            n={1}
            title="Create a project when a user creates an app"
            desc={<>Call this from your backend the moment one of your users spins up a new app. Store the returned <Code>_id</Code> next to that app in your own database.</>}
          >
            <CodeTabs snippets={projectSnips} />
          </Step>

          <Step
            n={2}
            title="Create a site and get the tracking snippet"
            desc={<>A site is what actually gets tracked. The response contains a ready-to-paste <Code>snippet</Code> — you never build the script tag yourself.</>}
          >
            <CodeTabs snippets={siteSnips} />
          </Step>

          <Step
            n={3}
            title="Inject the snippet into the generated app"
            desc={<>Put it in the <Code>&lt;head&gt;</Code> of the app you generate. ~1&nbsp;KB, loads async, sets no cookies, and tracks SPA route changes automatically.</>}
          >
            <CodeTabs snippets={injectSnips} />
          </Step>

          <Step
            n={4}
            title="Read the stats and render them in your UI"
            desc={<>Fetch from <b>your server</b>, verify the logged-in user owns that <Code>siteId</Code> in your own database, then return the numbers to your frontend. Poll every few seconds for a live feel.</>}
          >
            <CodeTabs snippets={statsSnips} />
          </Step>
        </Stack>
      </Card>

      {/* Custom events + errors */}
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="lg" padding="lg">
          <Text fw={650} mb="sm">Custom events</Text>
          <Text size="sm" c="dimmed" mb="md">
            Once the tracker has loaded, the app can record custom events (signups, purchases, clicks):
          </Text>
          <CodeTabs
            snippets={{
              JavaScript: `// available on window once tracker.js has loaded
window.rta.track("signup_completed");
window.rta.track("checkout_started");`,
            }}
          />
        </Card>

        <Card withBorder radius="lg" padding="lg">
          <Text fw={650} mb="sm">Response codes</Text>
          <Table verticalSpacing="xs" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr><Table.Th w={90}>Status</Table.Th><Table.Th>Meaning</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr><Table.Td><Badge color="teal" variant="light">201</Badge></Table.Td><Table.Td c="dimmed">Resource created.</Table.Td></Table.Tr>
              <Table.Tr><Table.Td><Badge color="gray" variant="light">204</Badge></Table.Td><Table.Td c="dimmed">Success, no body (deletes, event collection).</Table.Td></Table.Tr>
              <Table.Tr><Table.Td><Badge color="yellow" variant="light">400</Badge></Table.Td><Table.Td c="dimmed">Missing or invalid body field.</Table.Td></Table.Tr>
              <Table.Tr><Table.Td><Badge color="red" variant="light">401</Badge></Table.Td><Table.Td c="dimmed">Missing, malformed, or revoked API key.</Table.Td></Table.Tr>
              <Table.Tr><Table.Td><Badge color="orange" variant="light">404</Badge></Table.Td><Table.Td c="dimmed">Project or site not found <i>in this workspace</i>.</Table.Td></Table.Tr>
            </Table.Tbody>
          </Table>
        </Card>
      </SimpleGrid>

      <Text size="xs" c="dimmed" ta="center">
        Base URL <Code>{base}</Code> · Need something else? <Anchor href="mailto:support@vantage.dev">Talk to us</Anchor>
      </Text>
    </Stack>
  );
}

/* -------------------------------- Page ---------------------------------- */

export default function Developers() {
  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <Title order={1}>Developers</Title>
        <Text c="dimmed" size="sm" mt={6}>
          Offer real-time analytics to your own users — powered by Vantage, branded as you.
        </Text>
      </div>

      <Tabs defaultValue="docs" variant="pills" color="emerald">
        <Tabs.List mb="lg">
          <Tabs.Tab value="docs" leftSection={<BookOpen size={15} />}>Documentation</Tabs.Tab>
          <Tabs.Tab value="keys" leftSection={<KeyRound size={15} />}>API Keys</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="docs"><DocsTab /></Tabs.Panel>
        <Tabs.Panel value="keys"><KeysTab /></Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
