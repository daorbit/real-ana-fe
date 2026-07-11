import { useState } from "react";
import type { FormEvent } from "react";
import {
  Title, Text, Group, Button, Card, TextInput, ActionIcon, Badge, Stack,
  SimpleGrid, ThemeIcon, Center, Modal, CopyButton, Tooltip, Divider, Code,
  Box, Collapse,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Pencil, Check, X, FolderKanban, Globe, Copy, Repeat, Radar,
} from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";

import { InstallCheck } from "../components/InstallCheck";
import { CodeBlock } from "../components/CodeBlock";
import { RefreshButton } from "../components/Refresh";
import { useSites, useSiteInstalled } from "../hooks";
import { trackingSnippet, trackingSnippetPretty } from "../utils";
import * as v from "../utils/validate";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import type { Workspace, Site } from "../types";
import { WorkspacesSkeleton } from "../components/Skeletons";

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

/* A site row with live install status + an expandable verifier */
function SiteRow({
  site, workspaceId, snippet, onDelete,
}: { site: Site; workspaceId: string; snippet: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const installed = useSiteInstalled(workspaceId, site.siteId);

  const status =
    installed === true
      ? { dot: "var(--mantine-color-teal-6)", label: "Receiving data", color: "dimmed" as const }
      : installed === false
      ? { dot: "var(--muted)", label: "Waiting for first pageview", color: "dimmed" as const }
      : { dot: "transparent", label: "", color: "dimmed" as const };

  return (
    <Card withBorder radius="md" padding="md" className="site-row">
      <Group justify="space-between" wrap="nowrap" gap="lg">
        {/* identity */}
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon variant="default" radius="md" size={38}>
            <Globe size={17} />
          </ThemeIcon>

          <div style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate>{site.name}</Text>

            <Group gap={8} wrap="nowrap" mt={3}>
              <Text size="xs" c="dimmed" truncate>{site.domain}</Text>
              {installed !== null && (
                <>
                  <Text size="xs" c="dimmed">·</Text>
                  <Group gap={5} wrap="nowrap">
                    <span
                      className={installed ? "status-dot live" : "status-dot"}
                      style={{ background: status.dot }}
                    />
                    <Text size="xs" c={status.color}>{status.label}</Text>
                  </Group>
                </>
              )}
            </Group>
          </div>
        </Group>

        {/* actions */}
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Check if the script is reporting" withArrow>
            <Button
              size="xs"
              variant={open ? "light" : "default"}
              leftSection={<Radar size={13} />}
              onClick={() => setOpen((v) => !v)}
            >
              Verify
            </Button>
          </Tooltip>
          <CopyButton value={snippet}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy install snippet"} withArrow>
                <Button size="xs" variant="default" onClick={copy} leftSection={copied ? <Check size={13} /> : <Copy size={13} />}>
                  Snippet
                </Button>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Delete site" withArrow>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onDelete}>
              <Trash2 size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Collapse expanded={open}>
        <Box pt="md">
          <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
        </Box>
      </Collapse>
    </Card>
  );
}

export default function Workspaces() {
  const { workspaces, active, setActive, refresh, loading } = useWorkspace();

  // workspace create / rename
  const [wsOpen, setWsOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsError, setWsError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // add-site form
  const [siteOpen, setSiteOpen] = useState(false);
  const [name, setName] = useState("");
  const [domainValue, setDomainValue] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Site | null>(null);

  // `refresh` (from useWorkspace) reloads the workspace list;
  // `refreshSites` reloads the sites of the active workspace.
  const {
    sites,
    reload: loadSites,
    refresh: refreshSites,
    refreshing,
    lastUpdated,
  } = useSites(active?._id);

  const validateName = v.all(v.required("Site name"), v.minLength("Site name", 2), v.maxLength("Site name", 60));

  const resetSiteForm = () => {
    setName(""); setDomainValue("");
    setNameError(null); setDomainError(null);
  };

  const createWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    const err = v.all(v.required("Workspace name"), v.maxLength("Workspace name", 60))(wsName);
    setWsError(err);
    if (err) return;

    try {
      const ws = await api.post<Workspace>("/api/workspaces", { name: wsName.trim() });
      setWsName(""); setWsOpen(false); setWsError(null);
      await refresh();
      setActive(ws._id);
      notify.success(`Workspace "${ws.name}" created and set as active.`);
    } catch (err2) {
      notify.error(errMessage(err2, "Could not create the workspace."));
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

    const nErr = validateName(name);
    const dErr = v.domain(domainValue);
    setNameError(nErr);
    setDomainError(dErr);
    if (nErr || dErr) return;

    // Store the bare hostname, whatever the user pasted in.
    const cleanDomain = v.normalizeDomain(domainValue);

    if (sites.some((s) => s.domain.toLowerCase() === cleanDomain)) {
      setDomainError("A site with that domain already exists in this workspace");
      return;
    }

    setSaving(true);
    try {
      const site = await api.post<Site>(`/api/workspaces/${active._id}/sites`, {
        name: name.trim(),
        domain: cleanDomain,
      });
      resetSiteForm();
      setSiteOpen(false);
      setCreated(site);
      loadSites();
      notify.success(`Site "${site.name}" added. Copy the snippet to start tracking.`);
    } catch (err) {
      notify.error(errMessage(err, "Could not add the site."));
    } finally {
      setSaving(false);
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

  const snippet = trackingSnippet;

  const others = workspaces.filter((w) => w._id !== active?._id);

  // Render the page shape while the workspace list is still loading.
  if (loading) return <AppShell><WorkspacesSkeleton /></AppShell>;

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1}>Workspaces</Title>
          <Text c="dimmed" size="sm" mt={6}>Manage your workspaces and the sites they track.</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setWsOpen(true)}>Create Workspace</Button>
      </Group>

      {/* Create workspace modal */}
      <Modal
        opened={wsOpen}
        onClose={() => { setWsOpen(false); setWsError(null); }}
        title="Create workspace"
        centered
        radius="lg"
      >
        <form onSubmit={createWorkspace} noValidate>
          <Stack gap="md">
            <TextInput
              label="Workspace name"
              placeholder="e.g. Acme Inc"
              description="Groups the sites you want to track together."
              value={wsName}
              error={wsError}
              onChange={(e) => { setWsName(e.currentTarget.value); if (wsError) setWsError(null); }}
              onBlur={() => setWsError(v.all(v.required("Workspace name"), v.maxLength("Workspace name", 60))(wsName))}
              withAsterisk
              data-autofocus
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => { setWsOpen(false); setWsError(null); }}>Cancel</Button>
              <Button type="submit">Create workspace</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add site modal */}
      <Modal
        opened={siteOpen}
        onClose={() => { setSiteOpen(false); resetSiteForm(); }}
        title="Add a site"
        centered
        radius="lg"
      >
        <form onSubmit={addSite} noValidate>
          <Stack gap="md">
            <TextInput
              label="Site name"
              placeholder="My App"
              description="Just a label — only you see it."
              value={name}
              error={nameError}
              onChange={(e) => { setName(e.currentTarget.value); if (nameError) setNameError(null); }}
              onBlur={() => setNameError(validateName(name))}
              withAsterisk
              data-autofocus
            />
            <TextInput
              label="Domain"
              placeholder="app.com"
              description="The domain the tracking script runs on. Paste a full URL and we'll clean it up."
              value={domainValue}
              error={domainError}
              onChange={(e) => { setDomainValue(e.currentTarget.value); if (domainError) setDomainError(null); }}
              onBlur={() => {
                const clean = v.normalizeDomain(domainValue);
                if (clean !== domainValue) setDomainValue(clean);
                setDomainError(v.domain(clean));
              }}
              withAsterisk
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => { setSiteOpen(false); resetSiteForm(); }}>Cancel</Button>
              <Button type="submit" loading={saving}>Add site</Button>
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

            <CodeBlock
              code={trackingSnippetPretty(created.siteId)}
              filename="index.html"
              language="html"
            />

            <Group gap="xs">
              <Text size="xs" c="dimmed">Site ID:</Text>
              <Code>{created.siteId}</Code>
            </Group>

            {active && (
              <InstallCheck
                workspaceId={active._id}
                siteId={created.siteId}
                domain={created.domain}
              />
            )}

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

      {!active ? (
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
              <Group justify="space-between" mb="md">
                <Group gap={8}>
                  <Globe size={16} className="sect-ic" />
                  <Text fw={650} size="sm">Domains &amp; Sites</Text>
                  <Badge variant="light" color="gray" size="sm">{sites.length}</Badge>
                </Group>
                <RefreshButton onRefresh={refreshSites} refreshing={refreshing} lastUpdated={lastUpdated} compact />
              </Group>

              <Stack gap="sm">
                {sites.map((s) => (
                  <SiteRow
                    key={s._id}
                    site={s}
                    workspaceId={active._id}
                    snippet={snippet(s.siteId)}
                    onDelete={() => delSite(s)}
                  />
                ))}

                {sites.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    No sites yet. Add one to start collecting analytics.
                  </Text>
                )}
               <Box mt="md" style={{ display: "flex", justifyContent: "center" }}>
                <Button variant="subtle" style={{width:"fit-content"}} leftSection={<Plus size={16} />} onClick={() => setSiteOpen(true)}>
                  Add Another Site
                </Button>
                </Box>
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
