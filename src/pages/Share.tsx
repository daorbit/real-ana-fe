import {
  Text, Group, Button, Switch, TextInput, CopyButton, Tooltip, ActionIcon,
  Badge, Checkbox, SimpleGrid, Stack, Box, Center, ThemeIcon, Alert, Skeleton,
  Divider, Tabs, Select,
} from "@mantine/core";
import { useState } from "react";
import {
  Share2, Copy, Check, RefreshCw, ExternalLink, Eye, ShieldCheck, Link2Off,
  BarChart3, Search, Globe,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader, Section, Field, PageStack } from "../components/Page";
import {
  useGetShareQuery, useSetShareMutation, useGetSitesQuery, useGetSeoReportsQuery,
  useGetSeoShareQuery,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import { num, timeAgo } from "../utils";
import { scoreColor } from "../components/seo/ScoreRing";
import { SeoSharePanel } from "../components/seo/SeoSharePanel";
import { SaveBarProvider, useSaveRegistration } from "../components/SaveBar";
import type { SharePanels } from "../types";

type PanelDef = { key: keyof SharePanels; label: string; hint: string };

/**
 * The panels an owner can publish, grouped the way they'd be reasoned about
 * rather than the order they happen to appear on the public page.
 */
const PANEL_GROUPS: { heading: string; note?: string; panels: PanelDef[] }[] = [
  {
    heading: "Overview",
    panels: [
      { key: "totals", label: "Headline numbers", hint: "Visitors, pageviews, live" },
      { key: "trend", label: "Traffic chart", hint: "Views over the range" },
      { key: "engagement", label: "Engagement", hint: "Bounce rate, session length" },
      { key: "visitorSplit", label: "New vs returning", hint: "First-time and repeat" },
    ],
  },
  {
    heading: "Content",
    note: "Page paths can carry internal URLs you never meant to publish.",
    panels: [
      { key: "pages", label: "Top pages", hint: "Most visited paths" },
      { key: "entryPages", label: "Entry pages", hint: "Where sessions start" },
      { key: "exitPages", label: "Exit pages", hint: "Where sessions end" },
    ],
  },
  {
    heading: "Acquisition",
    panels: [
      { key: "sources", label: "Top sources", hint: "Referring sites" },
      { key: "channels", label: "Channels", hint: "Organic, paid, social, direct" },
    ],
  },
  {
    heading: "Audience",
    panels: [
      { key: "countries", label: "Countries", hint: "Visitors by country" },
      { key: "languages", label: "Languages", hint: "Browser language" },
      { key: "devices", label: "Devices", hint: "Desktop, mobile, tablet" },
      { key: "browsers", label: "Browsers", hint: "Chrome, Safari, Firefox" },
      { key: "operatingSystems", label: "Operating systems", hint: "Windows, macOS, iOS" },
    ],
  },
];

const ALL_PANELS = PANEL_GROUPS.flatMap((g) => g.panels);

/**
 * Mirrors the server defaults for a workspace that has never been configured.
 * Panels added after launch start off — an existing public link must not begin
 * publishing new breakdowns without the owner turning them on.
 */
const DEFAULT_PANELS: SharePanels = {
  totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
  browsers: false, operatingSystems: false, entryPages: false, exitPages: false,
  languages: false, channels: false, engagement: false, visitorSplit: false,
};

/**
 * Public dashboard settings for the active workspace.
 *
 * The link is unauthenticated — anyone holding it sees the numbers — so the
 * copy says that plainly rather than burying it, and rotating is treated as
 * destructive because it silently breaks links already sent to other people.
 */
function ShareSettings({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useGetShareQuery(workspaceId);
  const [setShare] = useSetShareMutation();
  // The mutation's shared `isLoading` would light up the link toggle and
  // New-link spinners during a panel-save, so the instant link actions
  // (enable/rotate) carry their own flag.
  const [linkBusy, setLinkBusy] = useState(false);

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const views = data?.views ?? 0;
  const url = token ? `${window.location.origin}/share/${token}` : "";

  // Server-side panels, with the launch defaults filled in.
  const serverPanels = { ...DEFAULT_PANELS, ...(data?.panels ?? {}) };

  // Checkbox edits buffer locally and commit through the floating Save bar —
  // only the link on/off and rotate act instantly. `null` means "no local
  // edits, follow the server".
  const [draft, setDraft] = useState<SharePanels | null>(null);
  const panels = draft ?? serverPanels;
  const onCount = ALL_PANELS.filter((p) => panels[p.key]).length;
  const dirty = draft !== null && ALL_PANELS.some((p) => draft[p.key] !== serverPanels[p.key]);

  const togglePanel = (key: keyof SharePanels, next: boolean) =>
    setDraft({ ...panels, [key]: next });

  const setAll = (next: boolean) =>
    setDraft(Object.fromEntries(ALL_PANELS.map((p) => [p.key, next])) as SharePanels);

  const savePanels = async () => {
    if (!draft) return;
    try {
      await setShare({ workspaceId, enabled, panels: draft }).unwrap();
      setDraft(null);
      notify.success("What visitors can see has been updated.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update what is shared."));
    }
  };

  useSaveRegistration(`analytics-panels`, {
    dirty,
    save: savePanels,
    reset: () => setDraft(null),
  });

  const toggle = async (next: boolean) => {
    setLinkBusy(true);
    try {
      await setShare({ workspaceId, enabled: next }).unwrap();
      notify.success(
        next ? "Anyone with the link can now view this dashboard." : "The public link is now off.",
        next ? "Sharing on" : "Sharing off",
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not update sharing."));
    } finally {
      setLinkBusy(false);
    }
  };

  const rotate = () => {
    confirmDelete({
      title: "Generate a new link?",
      confirmLabel: "Generate new link",
      body: (
        <>
          The current link will stop working immediately. Anyone you have
          already sent it to will lose access until you send them the new one.
        </>
      ),
      onConfirm: async () => {
        setLinkBusy(true);
        try {
          await setShare({ workspaceId, enabled: true, rotate: true }).unwrap();
          notify.success("A new link has been generated.", "Link replaced");
        } catch (e) {
          notify.error(errMessage(e, "Could not generate a new link."));
        } finally {
          setLinkBusy(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <PageStack maxWidth={1080}>
        <Skeleton height={132} radius="lg" />
        <Skeleton height={180} radius="lg" />
      </PageStack>
    );
  }

  return (
    <PageStack maxWidth={1080}>
      <Section
        title="Public link"
        description="Share a read-only view with clients or your team — no account needed."
      >
        <Field
          label="Public dashboard"
          hint={
            enabled
              ? "Live. Anyone with the link can view these numbers."
              : "Off. The link returns 404 until you turn this on."
          }
          last={!enabled}
        >
          <Group justify="flex-end" gap="sm" wrap="nowrap">
            {enabled && (
              <Badge size="sm" variant="light" color="emerald" radius="sm">
                Live
              </Badge>
            )}
            <Switch
              checked={enabled}
              onChange={(e) => toggle(e.currentTarget.checked)}
              color="emerald"
              disabled={linkBusy}
              aria-label="Enable public dashboard"
            />
          </Group>
        </Field>

        {enabled && token && (
          <>
            {/* The link gets a full-width row of its own rather than a Field:
                a share URL is long, and a truncated one can't be read back to
                check it before sending. */}
            <Box px="lg" py="md">
              <Text size="sm" fw={500}>Link</Text>
              <Text size="xs" c="dimmed" mt={3} mb="sm">
                Treat this like a password — the token is the only credential.
              </Text>
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  value={url}
                  readOnly
                  size="sm"
                  style={{ flex: 1, minWidth: 0 }}
                  styles={{ input: { fontFamily: "var(--mono, monospace)", fontSize: 13 } }}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Public dashboard link"
                />
                <CopyButton value={url}>
                  {({ copied, copy }) => (
                    <Button
                      size="sm"
                      variant={copied ? "light" : "default"}
                      color={copied ? "emerald" : undefined}
                      onClick={copy}
                      leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                      style={{ flexShrink: 0 }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </CopyButton>
                <Tooltip label="Open in a new tab" withArrow>
                  <ActionIcon
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    variant="default"
                    size="lg"
                    aria-label="Open public dashboard"
                  >
                    <ExternalLink size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
            <Divider />

            <Field
              label="Replace the link"
              hint="Use this if the current link reached someone it shouldn't have."
              last
            >
              <Group justify="flex-end">
                <Button
                  size="sm"
                  variant="default"
                  leftSection={<RefreshCw size={14} />}
                  onClick={rotate}
                  loading={linkBusy}
                >
                  New link
                </Button>
              </Group>
            </Field>
          </>
        )}
      </Section>

      {enabled && token && (
        <>
          {/* What the viewer sees is the owner's call — page paths in particular
              can carry internal URLs they never meant to publish. */}
          <Section
            title="What visitors can see"
            description="Anything turned off is never sent to the public page at all."
            actions={
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {onCount} of {ALL_PANELS.length} on
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={onCount === ALL_PANELS.length}
                  onClick={() => setAll(true)}
                >
                  All
                </Button>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={onCount === 0}
                  onClick={() => setAll(false)}
                >
                  None
                </Button>
              </Group>
            }
          >
            <Stack gap={0}>
              {PANEL_GROUPS.map((g, i) => (
                <Box key={g.heading}>
                  {i > 0 && <Divider />}
                  <Box p="lg">
                    <Text size="xs" fw={650} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.04em" }}>
                      {g.heading}
                    </Text>
                    {g.note && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {g.note}
                      </Text>
                    )}
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="md">
                      {g.panels.map((p) => (
                        <Checkbox
                          key={p.key}
                          size="sm"
                          color="emerald"
                          label={p.label}
                          description={p.hint}
                          checked={panels[p.key]}
                          onChange={(e) => togglePanel(p.key, e.currentTarget.checked)}
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Section>

          <Section title="Activity" description="How often the public link has been opened.">
            <Box p="lg">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
                  <Eye size={17} />
                </ThemeIcon>
                <div>
                  <Text fw={650}>
                    {num(views)} {views === 1 ? "open" : "opens"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {data?.lastViewedAt
                      ? `Last opened ${timeAgo(data.lastViewedAt)}. Resets when you replace the link.`
                      : "Not opened yet. Resets when you replace the link."}
                  </Text>
                </div>
              </Group>
            </Box>
          </Section>
        </>
      )}

      <Alert
        variant="light"
        color="gray"
        icon={<ShieldCheck size={16} />}
        title="What is never shared"
      >
        <Text size="sm">
          Site keys, workspace settings, team members and raw events stay
          private. The public page is read-only and cannot send events.
        </Text>
      </Alert>
    </PageStack>
  );
}

/** Hostname + path of an audited URL, for the audit list. */
function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

/**
 * One audited page as a card: a header row (score, page, live/off status) and
 * the full share controls revealed in place when expanded. No accordion chrome
 * — the whole card is a surface, and Manage flips it open.
 *
 * The status badge reads from the same share query the panel uses, so opening
 * the card costs no extra request — RTK serves the cached result.
 */
function AuditShareCard({
  workspaceId,
  siteId,
  reportId,
  url,
  score,
  createdAt,
  defaultOpen = false,
}: {
  workspaceId: string;
  siteId: string;
  reportId: string;
  url: string;
  score: number;
  createdAt: string;
  /** The first card starts open so the controls are visible without a click. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { data } = useGetSeoShareQuery({ workspaceId, siteId, reportId });
  const live = Boolean(data?.enabled);

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
      }}
    >
      <Group justify="space-between" wrap="nowrap" p="md" gap="sm">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Badge size="lg" variant="light" color={scoreColor(score)} radius="sm">
            {score}
          </Badge>
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} truncate>
              {prettyUrl(url)}
            </Text>
            <Text size="xs" c="dimmed">
              Audited {timeAgo(createdAt)}
            </Text>
          </div>
        </Group>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Badge
            size="sm"
            variant={live ? "light" : "outline"}
            color={live ? "emerald" : "gray"}
            radius="sm"
          >
            {live ? "Live" : "Off"}
          </Badge>
          <Button
            size="compact-sm"
            variant={open ? "light" : "default"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Manage"}
          </Button>
        </Group>
      </Group>

      {/* Kept mounted while collapsed so an unsaved draft and its Save-bar
          registration survive closing the card. */}
      <Box
        p="lg"
        display={open ? undefined : "none"}
        style={{
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-body)",
        }}
      >
        <SeoSharePanel workspaceId={workspaceId} siteId={siteId} reportId={reportId} />
      </Box>
    </Box>
  );
}

/**
 * SEO sharing for the active workspace: every audited page, each with its own
 * public link and section toggles. This is the same per-report control that
 * used to live behind a Share button on the SEO page — moved here so all of a
 * workspace's public links are managed in one place.
 */
function SeoShareTab({ workspaceId }: { workspaceId: string }) {
  const { data: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [siteId, setSiteId] = useState<string>("");
  const site = sites.find((s) => s.siteId === siteId) ?? sites[0] ?? null;
  const activeSiteId = site?.siteId ?? "";

  const { data: reports = [], isLoading: reportsLoading } = useGetSeoReportsQuery(
    { workspaceId, siteId: activeSiteId },
    { skip: !workspaceId || !activeSiteId }
  );

  // One row per audited page — the newest run of each URL. Re-runs of the same
  // page share a link, so listing every run would be noise.
  const latestPerUrl = (() => {
    const seen = new Set<string>();
    return reports.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));
  })();

  if (sitesLoading) {
    return (
      <PageStack maxWidth={1080}>
        <Skeleton height={80} radius="lg" />
        <Skeleton height={200} radius="lg" />
      </PageStack>
    );
  }

  if (!sites.length) {
    return (
      <PageStack maxWidth={1080}>
        <Center py={48}>
          <Stack align="center" gap={8} maw={400}>
            <ThemeIcon variant="light" color="gray" size={48} radius="md">
              <Globe size={22} />
            </ThemeIcon>
            <Text fw={650} mt={4}>No sites yet</Text>
            <Text c="dimmed" size="sm" ta="center">
              SEO audits run against a workspace's sites. Add one, run an audit,
              and its public link controls will show up here.
            </Text>
          </Stack>
        </Center>
      </PageStack>
    );
  }

  return (
    <PageStack maxWidth={1080}>
      <Section
        title="Shared audits"
        description="Each audited page gets its own read-only public link. Turn a link on, then choose what it shows."
        actions={
          sites.length > 1 && (
            <Select
              data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
              value={activeSiteId}
              onChange={(v) => v && setSiteId(v)}
              allowDeselect={false}
              size="sm"
              w={220}
              leftSection={<Globe size={15} />}
              radius="md"
              comboboxProps={{ radius: "md" }}
            />
          )
        }
      >
        {reportsLoading ? (
          <Box p="lg">
            <Skeleton height={120} radius="md" />
          </Box>
        ) : latestPerUrl.length === 0 ? (
          <Box p="lg">
            <Text size="sm" c="dimmed">
              No audits for this site yet. Run one on the SEO page and it will
              appear here.
            </Text>
          </Box>
        ) : (
          <Stack gap="md" p="lg">
            {latestPerUrl.map((r, i) => (
              <AuditShareCard
                key={r._id}
                workspaceId={workspaceId}
                siteId={activeSiteId}
                reportId={r._id}
                url={r.url}
                score={r.score}
                createdAt={r.createdAt}
                defaultOpen={i === 0}
              />
            ))}
          </Stack>
        )}
      </Section>

      <Alert
        variant="light"
        color="gray"
        icon={<ShieldCheck size={16} />}
        title="What is never shared"
      >
        <Text size="sm">
          Your site key, other audits and workspace settings are never shared.
          Each public page is read-only.
        </Text>
      </Alert>
    </PageStack>
  );
}

/** Shown when there is no workspace to configure sharing for. */
function NoWorkspace() {
  return (
    <Center py={64}>
      <Stack align="center" gap={8} maw={380}>
        <ThemeIcon variant="light" color="gray" size={48} radius="md">
          <Link2Off size={22} />
        </ThemeIcon>
        <Text fw={650} mt={4}>No workspace selected</Text>
        <Text c="dimmed" size="sm" ta="center">
          Public dashboards are published per workspace. Create or pick one
          first, then come back here to share it.
        </Text>
        <Button component="a" href="/app/workspaces" variant="light" mt="sm">
          Go to workspaces
        </Button>
      </Stack>
    </Center>
  );
}

export default function Share() {
  const { active } = useWorkspace();

  return (
    <AppShell>
      <PageHeader
        title="Public sharing"
        description="Publish read-only views of this workspace — analytics and SEO audits — at links anyone can open."
        actions={
          <Badge
            variant="light"
            color="gray"
            radius="sm"
            leftSection={<Share2 size={12} />}
          >
            {active?.name ?? "No workspace"}
          </Badge>
        }
      />
      {active ? (
        <Tabs key={active._id} defaultValue="analytics" keepMounted={false}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="analytics" leftSection={<BarChart3 size={15} />}>
              Analytics
            </Tabs.Tab>
            <Tabs.Tab value="seo" leftSection={<Search size={15} />}>
              SEO
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="analytics">
            <SaveBarProvider>
              <ShareSettings workspaceId={active._id} />
            </SaveBarProvider>
          </Tabs.Panel>
          <Tabs.Panel value="seo">
            <SaveBarProvider>
              <SeoShareTab workspaceId={active._id} />
            </SaveBarProvider>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <NoWorkspace />
      )}
    </AppShell>
  );
}
