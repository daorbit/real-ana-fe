import { useState } from "react";
import type { FormEvent } from "react";
import {
  Title, Text, Group, Button, Card, TextInput, ActionIcon, Badge, Stack,
  SimpleGrid, ThemeIcon, Center, Modal, CopyButton, Tooltip, Divider,
  Box, Collapse, UnstyledButton,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Pencil, Check, X, FolderKanban, Globe, Copy, Radar, Search,
} from "lucide-react";
import { AppShell } from "../components/AppShell";

import { InstallCheck } from "../components/InstallCheck";
import { SnippetBuilder } from "../components/SnippetBuilder";
import { RefreshButton } from "../components/Refresh";
import {
  useCreateWorkspaceMutation, useRenameWorkspaceMutation, useDeleteWorkspaceMutation,
  useDeleteSiteMutation,
} from "../store";
import { useSites, useSiteInstalled } from "../hooks";
import * as v from "../utils/validate";
import { shortDate } from "../utils";
import { notify, errMessage, confirmDestroy } from "../notify";
import { useWorkspace } from "../workspace";
import type { Workspace, Site } from "../types";
import { WorkspacesSkeleton } from "../components/Skeletons";
import { AddSiteWizard } from "../components/AddSiteWizard";
import { SiteFavicon } from "../components/SiteFavicon";
import { BrandIcon } from "../components/BrandIcon";
import { PageHeader } from "../components/Page";
import { getFramework } from "../utils/frameworks";
import type { FrameworkId } from "../utils/frameworks";

/* Small id + copy row */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
      <Text size="xs" c="dimmed" truncate style={{ minWidth: 0 }}>{label}: {value}</Text>
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
  site, workspaceId, onDelete,
}: { site: Site; workspaceId: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const installed = useSiteInstalled(workspaceId, site.siteId);

  // Copy the same code the panel below shows - framework and saved options
  // included - rather than a bare HTML tag that contradicts it.
  const guide = getFramework(site.framework);
  const snippet = guide.code(site.siteId, site.trackerOptions ?? {});

  // "Other" carries no information worth a badge - every site is something,
  // and a row of grey "Other" chips is noise.
  const frameworkLabel = guide.id === "other" ? null : guide.label;

  const status =
    installed === true
      ? { dot: "var(--mantine-color-teal-6)", label: "Receiving data", color: "dimmed" as const }
      : installed === false
      ? { dot: "var(--muted)", label: "Waiting for first pageview", color: "dimmed" as const }
      : { dot: "transparent", label: "", color: "dimmed" as const };

  return (
    <Card withBorder radius="md" padding="md" className="site-row">
      {/* Row on desktop; on a phone the actions drop under the identity so the
          name has the full width instead of being crushed to "Q…". */}
      <div className="site-row-top">
        {/* identity */}
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          {/* The site's own favicon, so a list of domains is scannable by
              sight rather than by reading every row. */}
          <Box className="site-favicon">
            <SiteFavicon domain={site.domain} framework={site.framework} size={20} />
          </Box>

          <div style={{ minWidth: 0 }}>
            <Group gap={8} wrap="nowrap">
              <Text fw={600} size="sm" truncate>{site.name}</Text>
              {frameworkLabel && (
                <Badge
                  size="xs"
                  variant="default"
                  radius="sm"
                  leftSection={<BrandIcon framework={site.framework as FrameworkId} size={10} />}
                  style={{ flexShrink: 0, textTransform: "none", fontWeight: 500 }}
                >
                  {frameworkLabel}
                </Badge>
              )}
            </Group>

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
        <Group gap={6} wrap="nowrap" className="site-row-actions">
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
      </div>

      <Collapse expanded={open}>
        <Box pt="md">
          <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
          <Divider my="lg" label="Install snippet" labelPosition="center" />
          <SnippetBuilder
            siteId={site.siteId}
            workspaceId={workspaceId}
            options={site.trackerOptions}
            framework={site.framework}
          />
        </Box>
      </Collapse>
    </Card>
  );
}

export default function Workspaces() {
  const { workspaces, active, setActive, loading } = useWorkspace();

  // workspace create / rename
  const [wsOpen, setWsOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsError, setWsError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Add-site is a self-contained wizard; this page only opens and closes it.
  const [siteOpen, setSiteOpen] = useState(false);

  // Site search. Only rendered once the list is long enough to scroll, so a
  // workspace with two sites doesn't carry a control it has no use for.
  const [siteQuery, setSiteQuery] = useState("");

  // Cached by RTK Query; the mutations below invalidate it, so the list
  // refreshes on its own after a create or delete.
  const { sites, refresh: refreshSites, refreshing, lastUpdated } = useSites(active?._id);

  const q = siteQuery.trim().toLowerCase();
  const shownSites = q
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
      )
    : sites;
  // Below this the eye scans faster than any filter would, and the box is just
  // a dead control taking up header width.
  const searchable = sites.length >= 3;

  const [createWs, { isLoading: creatingWs }] = useCreateWorkspaceMutation();
  const [renameWs] = useRenameWorkspaceMutation();
  const [deleteWs] = useDeleteWorkspaceMutation();
  const [deleteSiteMut] = useDeleteSiteMutation();

  const createWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    const err = v.all(v.required("Workspace name"), v.maxLength("Workspace name", 60))(wsName);
    setWsError(err);
    if (err) return;

    try {
      const ws = await createWs({ name: wsName.trim() }).unwrap();
      setWsName(""); setWsOpen(false); setWsError(null);
      setActive(ws._id);
      notify.success(`Workspace "${ws.name}" created and set as active.`);
    } catch (err2) {
      notify.error(errMessage(err2, "Could not create the workspace."));
    }
  };

  const renameError = v.all(
    v.required("Workspace name"),
    v.maxLength("Workspace name", 60)
  )(editName);

  const saveRename = async () => {
    if (!active) return;
    // An empty name would leave the workspace unlabelled everywhere it appears
    // — the sidebar, the switcher, the palette.
    if (renameError) return;
    // Nothing to send, and no reason to show a success toast for a no-op.
    if (editName.trim() === active.name) {
      setEditing(false);
      return;
    }
    try {
      await renameWs({ id: active._id, name: editName.trim() }).unwrap();
      setEditing(false);
      notify.success("Workspace renamed.");
    } catch (err) {
      notify.error(errMessage(err, "Could not rename the workspace."));
    }
  };

  // Deleting a workspace destroys history that cannot be re-collected, so it
  // asks for the name to be typed rather than for one more click on a dialog
  // people have learned to dismiss.
  const removeWorkspace = (w: Workspace) => {
    const count = w._id === active?._id ? sites.length : null;
    confirmDestroy({
      title: `Delete workspace "${w.name}"?`,
      phrase: w.name,
      body: "Everything tracked under this workspace is removed from Quantalog.",
      consequences: [
        count === null
          ? "Every site in this workspace is deleted"
          : `${count} ${count === 1 ? "site is" : "sites are"} deleted`,
        "All collected analytics history is erased",
        "Public dashboard links for these sites stop working",
        "Any app still running the snippet stops reporting",
      ],
      confirmLabel: "Delete workspace",
      onConfirm: async () => {
        try {
          await deleteWs(w._id).unwrap();
          notify.success(`Workspace "${w.name}" deleted.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the workspace."));
        }
      },
    });
  };

  const delSite = (s: Site) => {
    if (!active) return;
    confirmDestroy({
      title: `Delete site "${s.name}"?`,
      phrase: s.name,
      body: `Removes ${s.domain} and everything Quantalog has recorded for it.`,
      consequences: [
        "All pageviews, events and goals for this site are erased",
        "The site's public dashboard link stops working",
        "Any app still running the snippet stops reporting",
      ],
      confirmLabel: "Delete site",
      onConfirm: async () => {
        try {
          await deleteSiteMut({ workspaceId: active._id, siteId: s.siteId }).unwrap();
          notify.success(`Site "${s.name}" deleted.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the site."));
        }
      },
    });
  };

  // Render the page shape while the workspace list is still loading.
  if (loading) return <AppShell><WorkspacesSkeleton /></AppShell>;

  return (
    <AppShell>
      <PageHeader
        title="Workspaces"
        description="Manage your workspaces and the sites they track."
        actions={
          <Button variant="default" leftSection={<Plus size={16} />} onClick={() => setWsOpen(true)}>
            New workspace
          </Button>
        }
      />

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
              <Button variant="default" disabled={creatingWs} onClick={() => { setWsOpen(false); setWsError(null); }}>Cancel</Button>
              <Button type="submit" loading={creatingWs}>Create workspace</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add site: details -> tracking options -> snippet */}
      {active && (
        <AddSiteWizard
          opened={siteOpen}
          onClose={() => setSiteOpen(false)}
          workspaceId={active._id}
          existingDomains={sites.map((s) => s.domain.toLowerCase())}
        />
      )}

      {!active ? (
        <Center mih="50vh">
          <Stack align="center" gap="sm" maw={360}>
            <ThemeIcon variant="light" color="gray" size={56} radius="md">
              <FolderKanban size={26} />
            </ThemeIcon>
            <Text fw={600} mt={4}>No workspaces yet</Text>
            <Text c="dimmed" size="sm" ta="center">
              A workspace groups the sites you track together - usually your
              company, or one client.
            </Text>
            <Button mt="sm" leftSection={<Plus size={16} />} onClick={() => setWsOpen(true)}>
              Create your first
            </Button>
          </Stack>
        </Center>
      ) : (
        /* Two columns: the workspace list stays on the left so switching is
           one click, rather than scrolling past the active workspace to reach
           a grid of cards at the bottom of the page. */
        <div className="ws-layout">
          <aside className="ws-sidebar">
            <p className="nav-heading">Workspaces</p>
            <Stack gap={4}>
              {workspaces.map((w) => {
                const isActive = w._id === active._id;
                return (
                  <UnstyledButton
                    key={w._id}
                    className="ws-item"
                    data-active={isActive}
                    onClick={() => setActive(w._id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <ThemeIcon
                      variant={isActive ? "filled" : "light"}
                      color={isActive ? "emerald" : "gray"}
                      radius="md"
                      size={30}
                    >
                      <FolderKanban size={14} />
                    </ThemeIcon>
                    <Text
                      size="sm"
                      fw={isActive ? 600 : 500}
                      truncate
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {w.name}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </Stack>

            <Button
              variant="subtle"
              color="gray"
              size="sm"
              fullWidth
              mt="sm"
              leftSection={<Plus size={15} />}
              onClick={() => setWsOpen(true)}
            >
              New workspace
            </Button>
          </aside>

          {/* Keyed on the workspace id so switching replays the entrance -
              otherwise the column swaps content with no sign it changed. */}
          <motion.div
            key={active._id}
            className="ws-main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Box className="ws-head" mb="lg">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <div style={{ minWidth: 0 }}>
                  {editing ? (
                    <Group gap="xs" wrap="nowrap">
                      <TextInput
                        size="sm"
                        value={editName}
                        error={editName ? renameError : null}
                        onChange={(e) => setEditName(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename();
                          // Escape is what people reach for to back out of an
                          // inline edit — without it the only way out is the X.
                          if (e.key === "Escape") setEditing(false);
                        }}
                        w={260}
                        autoFocus
                        aria-label="Workspace name"
                      />
                      <ActionIcon
                        variant="light"
                        color="emerald"
                        onClick={saveRename}
                        disabled={!!renameError}
                        title="Save"
                      >
                        <Check size={15} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setEditing(false)}
                        title="Cancel"
                      >
                        <X size={15} />
                      </ActionIcon>
                    </Group>
                  ) : (
                    <Group gap="xs" wrap="nowrap">
                      <Title
                        order={2}
                        style={{
                          letterSpacing: "-0.02em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {active.name}
                      </Title>
                      <ActionIcon
                        className="ws-rename"
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => {
                          setEditing(true);
                          setEditName(active.name);
                        }}
                        title="Rename workspace"
                      >
                        <Pencil size={14} />
                      </ActionIcon>
                    </Group>
                  )}
                  <Box mt={6}>
                    <IdRow label="Workspace ID" value={active._id} />
                  </Box>
                </div>

                <Group gap="xs" wrap="nowrap">
                  <Button leftSection={<Plus size={15} />} onClick={() => setSiteOpen(true)}>
                    Add site
                  </Button>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="lg"
                    onClick={() => removeWorkspace(active)}
                    title="Delete workspace"
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>

            {/* At-a-glance counts - the first thing you check on opening a
                workspace, and cheaper to read than counting rows. */}
            <SimpleGrid cols={3} spacing="sm" mb="lg">
              <Box className="ws-stat">
                <Text className="ws-stat-label">Sites</Text>
                <Text className="ws-stat-value">{sites.length}</Text>
              </Box>
              <Box className="ws-stat">
                <Text className="ws-stat-label">Created</Text>
                <Text className="ws-stat-value sm">{shortDate(active.createdAt)}</Text>
              </Box>
              <Box className="ws-stat">
                <Text className="ws-stat-label">Workspaces</Text>
                <Text className="ws-stat-value">{workspaces.length}</Text>
              </Box>
            </SimpleGrid>

            <Group justify="space-between" mb="sm" wrap="nowrap">
              <Group gap={8}>
                <Globe size={15} className="sect-ic" />
                <Text fw={650} size="sm">Sites</Text>
                <Badge variant="default" size="sm" radius="sm">
                  {/* While filtering, the count has to describe what's on
                      screen — otherwise it contradicts the list under it. */}
                  {q ? `${shownSites.length} of ${sites.length}` : sites.length}
                </Badge>
              </Group>
              <Group gap="xs" wrap="nowrap">
                {searchable && (
                  <TextInput
                    size="xs"
                    w={200}
                    placeholder="Filter sites…"
                    value={siteQuery}
                    onChange={(e) => setSiteQuery(e.currentTarget.value)}
                    leftSection={<Search size={13} />}
                    rightSection={
                      siteQuery ? (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => setSiteQuery("")}
                          aria-label="Clear filter"
                        >
                          <X size={13} />
                        </ActionIcon>
                      ) : null
                    }
                    aria-label="Filter sites by name or domain"
                  />
                )}
                <RefreshButton
                  onRefresh={refreshSites}
                  refreshing={refreshing}
                  lastUpdated={lastUpdated}
                  compact
                />
              </Group>
            </Group>

            {sites.length === 0 ? (
              <Box className="surface-card">
                <Stack align="center" gap={6} py={48} px="lg">
                  <ThemeIcon variant="light" color="gray" size={44} radius="md">
                    <Globe size={20} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" mt={4}>No sites yet</Text>
                  <Text c="dimmed" size="xs" ta="center" maw={340}>
                    Add the site you want to track and we&apos;ll hand you the
                    install snippet for your framework.
                  </Text>
                  <Button
                    size="xs"
                    mt="sm"
                    leftSection={<Plus size={14} />}
                    onClick={() => setSiteOpen(true)}
                  >
                    Add your first site
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack gap="sm">
                {shownSites.length === 0 && (
                  <Box className="surface-card">
                    <Stack align="center" gap={6} py={36} px="lg">
                      <Text fw={600} size="sm">No sites match “{siteQuery}”</Text>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => setSiteQuery("")}
                      >
                        Clear filter
                      </Button>
                    </Stack>
                  </Box>
                )}
                {shownSites.map((s, i) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 6) * 0.04, duration: 0.25 }}
                  >
                    <SiteRow site={s} workspaceId={active._id} onDelete={() => delSite(s)} />
                  </motion.div>
                ))}
                {/* Stack stretches its children, which turned this into a
                    full-width bar. Centre it at its natural width instead. */}
                <Group justify="center" mt={4}>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="sm"
                    leftSection={<Plus size={15} />}
                    onClick={() => setSiteOpen(true)}
                  >
                    Add another site
                  </Button>
                </Group>
              </Stack>
            )}
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
