import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import {
  Title, Text, Group, Button, Card, TextInput, Select, ActionIcon, Badge, Stack,
  SimpleGrid, ThemeIcon, Center, Modal, CopyButton, Tooltip, Divider, Code,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Pencil, Check, X, FolderKanban, Globe, Copy, Repeat,
} from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { FrameworkIcon } from "../components/Brand";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import type { Workspace, Site } from "../types";

const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"];

/* Small id + copy row */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Text size="xs" c="dimmed">{label}: {value}</Text>
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
            <ActionIcon variant="subtle" color="gray" size="xs" onClick={copy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

export default function Workspaces() {
  const { workspaces, active, setActive, refresh, loading } = useWorkspace();

  // workspace create / rename
  const [wsOpen, setWsOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // sites of the active workspace
  const [sites, setSites] = useState<Site[]>([]);
  const [siteOpen, setSiteOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState("react");
  const [created, setCreated] = useState<Site | null>(null);

  const loadSites = useCallback(() => {
    if (!active) { setSites([]); return; }
    api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => setSites([]));
  }, [active]);

  useEffect(loadSites, [loadSites]);

  const createWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const ws = await api.post<Workspace>("/api/workspaces", { name: wsName });
      setWsName(""); setWsOpen(false);
      await refresh();
      setActive(ws._id);
      notify.success(`Workspace "${ws.name}" created and set as active.`);
    } catch (err) {
      notify.error(errMessage(err, "Could not create the workspace."));
    }
  };

  const saveRename = async () => {
    if (!active) return;
    try {
      await api.patch(`/api/workspaces/${active._id}`, { name: editName });
      setEditing(false);
      await refresh();
      notify.success("Workspace renamed.");
    } catch (err) {
      notify.error(errMessage(err, "Could not rename the workspace."));
    }
  };

  const removeWorkspace = (w: Workspace) => {
    confirmDelete({
      title: `Delete "${w.name}"?`,
      body: "This permanently removes the workspace, every site inside it, and all collected analytics. This cannot be undone.",
      confirmLabel: "Delete workspace",
      onConfirm: async () => {
        try {
          await api.del(`/api/workspaces/${w._id}`);
          await refresh();
          notify.success(`Workspace "${w.name}" deleted.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the workspace."));
        }
      },
    });
  };

  const addSite = async (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    try {
      const site = await api.post<Site>(`/api/workspaces/${active._id}/sites`, { name, domain, framework });
      setName(""); setDomain(""); setSiteOpen(false);
      setCreated(site);
      loadSites();
      notify.success(`Site "${site.name}" added. Copy the snippet to start tracking.`);
    } catch (err) {
      notify.error(errMessage(err, "Could not add the site."));
    }
  };

  const delSite = (s: Site) => {
    if (!active) return;
    confirmDelete({
      title: `Delete site "${s.name}"?`,
      body: "This removes the site and every event collected for it. Any app still running the snippet will stop reporting.",
      confirmLabel: "Delete site",
      onConfirm: async () => {
        try {
          await api.del(`/api/workspaces/${active._id}/sites/${s.siteId}`);
          if (created?.siteId === s.siteId) setCreated(null);
          loadSites();
          notify.success(`Site "${s.name}" deleted.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the site."));
        }
      },
    });
  };

  const snippet = (siteId: string) =>
    `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;

  const others = workspaces.filter((w) => w._id !== active?._id);

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Workspaces</Title>
          <Text c="dimmed" size="sm" mt={6}>Manage your workspaces and the sites they track.</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setWsOpen((v) => !v)}>Create Workspace</Button>
      </Group>

      {/* Create workspace modal */}
      <Modal opened={wsOpen} onClose={() => setWsOpen(false)} title="Create workspace" centered radius="lg">
        <form onSubmit={createWorkspace}>
          <Stack gap="md">
            <TextInput
              label="Workspace name"
              placeholder="e.g. Acme Inc"
              description="Groups the sites you want to track together."
              value={wsName}
              onChange={(e) => setWsName(e.currentTarget.value)}
              required
              data-autofocus
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setWsOpen(false)}>Cancel</Button>
              <Button type="submit">Create workspace</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add site modal */}
      <Modal opened={siteOpen} onClose={() => setSiteOpen(false)} title="Add a site" centered radius="lg">
        <form onSubmit={addSite}>
          <Stack gap="md">
            <TextInput label="Site name" placeholder="My App" value={name} onChange={(e) => setName(e.currentTarget.value)} required data-autofocus />
            <TextInput label="Domain" placeholder="app.com" description="The domain where the tracking script will run." value={domain} onChange={(e) => setDomain(e.currentTarget.value)} required />
            <Select label="Framework" data={FRAMEWORKS} value={framework} onChange={(v) => v && setFramework(v)} comboboxProps={{ withinPortal: true }} />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setSiteOpen(false)}>Cancel</Button>
              <Button type="submit">Add site</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Snippet modal — shown right after a site is created */}
      <Modal
        opened={!!created}
        onClose={() => setCreated(null)}
        title={created ? `Install “${created.name}”` : ""}
        centered
        radius="lg"
        size="lg"
      >
        {created && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Paste this snippet just before the closing <Code>&lt;/head&gt;</Code> tag on{" "}
              <b>{created.domain}</b>. Traffic starts appearing in Analytics within seconds.
            </Text>

            <Card withBorder radius="md" padding="sm" bg="var(--surface-2)">
              <Code block style={{ background: "transparent" }}>{snippet(created.siteId)}</Code>
            </Card>

            <Group gap="xs">
              <Text size="xs" c="dimmed">Site ID:</Text>
              <Code>{created.siteId}</Code>
            </Group>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setCreated(null)}>Done</Button>
              <CopyButton value={snippet(created.siteId)}>
                {({ copied, copy }) => (
                  <Button onClick={copy} leftSection={copied ? <Check size={15} /> : <Copy size={15} />}>
                    {copied ? "Copied" : "Copy snippet"}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>

      {loading ? (
        <Text c="dimmed">Loading…</Text>
      ) : !active ? (
        <Center mih="40vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size={56} radius="md"><FolderKanban size={28} /></ThemeIcon>
            <Text c="dimmed">No workspaces yet.</Text>
            <Button leftSection={<Plus size={16} />} onClick={() => setWsOpen(true)}>Create your first</Button>
          </Stack>
        </Center>
      ) : (
        <>
          {/* ---------- Active workspace panel ---------- */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card withBorder radius="lg" padding="xl" mb="xl" className="ws-active">
              <Group justify="space-between" align="flex-start" mb="xs">
                <div>
                  <Group gap="xs" mb={4}>
                    {editing ? (
                      <>
                        <TextInput size="xs" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} w={220} autoFocus />
                        <ActionIcon variant="subtle" color="green" onClick={saveRename}><Check size={15} /></ActionIcon>
                        <ActionIcon variant="subtle" color="gray" onClick={() => setEditing(false)}><X size={15} /></ActionIcon>
                      </>
                    ) : (
                      <>
                        <Title order={3}>{active.name}</Title>
                        <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { setEditing(true); setEditName(active.name); }} title="Rename">
                          <Pencil size={14} />
                        </ActionIcon>
                        <Badge color="green" variant="light" size="sm">Active</Badge>
                      </>
                    )}
                  </Group>
                  <IdRow label="Workspace Id" value={active._id} />
                </div>
                <ActionIcon variant="subtle" color="red" onClick={() => removeWorkspace(active)} title="Delete workspace">
                  <Trash2 size={16} />
                </ActionIcon>
              </Group>

              <Divider my="lg" />

              {/* ---------- Domains & Sites ---------- */}
              <Group gap={8} mb="md">
                <Globe size={16} className="sect-ic" />
                <Text fw={650} size="sm">Domains &amp; Sites</Text>
                <Badge variant="light" color="gray" size="sm">{sites.length}</Badge>
              </Group>

              <Stack gap="sm">
                {sites.map((s) => (
                  <Card key={s._id} withBorder radius="md" padding="sm" className="site-row">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <ThemeIcon variant="light" color="gray" radius="md" size="lg"><Globe size={16} /></ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Group gap={6}>
                            <Text fw={600} size="sm" truncate>{s.name}</Text>
                            <Badge size="xs" variant="light" color="gray" leftSection={<FrameworkIcon name={s.framework} />} tt="capitalize">
                              {s.framework}
                            </Badge>
                          </Group>
                          <Text size="xs" c="violet" truncate>{s.domain}</Text>
                        </div>
                      </Group>
                      <Group gap={4} wrap="nowrap">
                        <CopyButton value={snippet(s.siteId)}>
                          {({ copied, copy }) => (
                            <Button size="compact-xs" variant="default" onClick={copy} leftSection={copied ? <Check size={12} /> : <Copy size={12} />}>
                              {copied ? "Copied" : "Snippet"}
                            </Button>
                          )}
                        </CopyButton>
                        <ActionIcon variant="subtle" color="red" onClick={() => delSite(s)} title="Delete site">
                          <Trash2 size={15} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                ))}

                {sites.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    No sites yet. Add one to start collecting analytics.
                  </Text>
                )}

                <Button variant="subtle" fullWidth leftSection={<Plus size={16} />} onClick={() => setSiteOpen(true)}>
                  Add Another Site
                </Button>
              </Stack>

            </Card>
          </motion.div>

          {/* ---------- Other workspaces ---------- */}
          {others.length > 0 && (
            <>
              <Text fw={650} size="sm" mb="md">Other Workspaces</Text>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {others.map((w, i) => (
                  <motion.div key={w._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card withBorder radius="lg" padding="lg">
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Text fw={650}>{w.name}</Text>
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeWorkspace(w)} title="Delete">
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                      <IdRow label="Workspace Id" value={w._id} />
                      <Button
                        variant="default" fullWidth mt="md"
                        leftSection={<Repeat size={14} />}
                        onClick={() => setActive(w._id)}
                      >
                        Switch to workspace
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </SimpleGrid>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
