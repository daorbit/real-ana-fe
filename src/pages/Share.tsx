import {
  Text, Group, Button, Switch, TextInput, CopyButton, Tooltip, ActionIcon,
  Badge, Checkbox, SimpleGrid, Stack, Box, Center, ThemeIcon, Alert, Skeleton,
  Divider, Tabs, Select,
} from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy, Check, RefreshCw, ExternalLink, Eye, ShieldCheck, Link2Off,
  BarChart3, Search, Globe,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader, Section, Field, PageStack } from "../components/Page";
import { PageHelpButton } from "../components/PageHelpButton";
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

// Panel `key` doubles as the i18n stem: label is `share.panel.<key>`, hint is
// `share.panel.<key>Hint`. Group headings/notes resolve from `share.group.*`.
// Keeping only keys here means the whole grid follows the interface language.
type PanelDef = { key: keyof SharePanels };

/**
 * The panels an owner can publish, grouped the way they'd be reasoned about
 * rather than the order they happen to appear on the public page.
 */
const PANEL_GROUPS: { headingKey: string; noteKey?: string; panels: PanelDef[] }[] = [
  {
    headingKey: "share.group.overview",
    panels: [
      { key: "totals" }, { key: "trend" }, { key: "engagement" }, { key: "visitorSplit" },
    ],
  },
  {
    headingKey: "share.group.content",
    noteKey: "share.group.contentNote",
    panels: [
      { key: "pages" }, { key: "entryPages" }, { key: "exitPages" },
    ],
  },
  {
    headingKey: "share.group.acquisition",
    panels: [
      { key: "sources" }, { key: "channels" },
    ],
  },
  {
    headingKey: "share.group.audience",
    panels: [
      { key: "countries" }, { key: "languages" }, { key: "devices" },
      { key: "browsers" }, { key: "operatingSystems" },
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
  const { t } = useTranslation();
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
      notify.success(t("share.panelsUpdated"));
    } catch (e) {
      notify.error(errMessage(e, t("share.panelsError")));
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
        next ? t("share.sharingOnBody") : t("share.sharingOffBody"),
        next ? t("share.sharingOn") : t("share.sharingOff"),
      );
    } catch (e) {
      notify.error(errMessage(e, t("share.sharingError")));
    } finally {
      setLinkBusy(false);
    }
  };

  const rotate = () => {
    confirmDelete({
      title: t("share.rotateTitle"),
      confirmLabel: t("share.rotateConfirm"),
      body: <>{t("share.rotateBody")}</>,
      onConfirm: async () => {
        setLinkBusy(true);
        try {
          await setShare({ workspaceId, enabled: true, rotate: true }).unwrap();
          notify.success(t("share.rotateSuccess"), t("share.rotateSuccessTitle"));
        } catch (e) {
          notify.error(errMessage(e, t("share.rotateError")));
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
        title={t("share.publicLink")}
        description={t("share.publicLinkDesc")}
      >
        <Field
          label={t("share.publicDashboard")}
          hint={enabled ? t("share.liveHint") : t("share.offHint")}
          last={!enabled}
        >
          <Group justify="flex-end" gap="sm" wrap="nowrap">
            {enabled && (
              <Badge size="sm" variant="light" color="emerald" radius="sm">
                {t("share.live")}
              </Badge>
            )}
            <Switch
              checked={enabled}
              onChange={(e) => toggle(e.currentTarget.checked)}
              color="emerald"
              disabled={linkBusy}
              aria-label={t("share.enableAria")}
            />
          </Group>
        </Field>

        {enabled && token && (
          <>
            {/* The link gets a full-width row of its own rather than a Field:
                a share URL is long, and a truncated one can't be read back to
                check it before sending. */}
            <Box px="lg" py="md">
              <Text size="sm" fw={500}>{t("share.link")}</Text>
              <Text size="xs" c="dimmed" mt={3} mb="sm">
                {t("share.linkWarning")}
              </Text>
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  value={url}
                  readOnly
                  size="sm"
                  style={{ flex: 1, minWidth: 0 }}
                  styles={{ input: { fontFamily: "var(--mono, monospace)", fontSize: 13 } }}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={t("share.linkAria")}
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
                      {copied ? t("share.copied") : t("share.copy")}
                    </Button>
                  )}
                </CopyButton>
                <Tooltip label={t("share.openNewTab")} withArrow>
                  <ActionIcon
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    variant="default"
                    size="lg"
                    aria-label={t("share.openAria")}
                  >
                    <ExternalLink size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
            <Divider />

            <Field
              label={t("share.replaceLink")}
              hint={t("share.replaceHint")}
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
                  {t("share.newLink")}
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
            title={t("share.whatVisitorsSee")}
            description={t("share.whatVisitorsSeeDesc")}
            actions={
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {t("share.onOf", { on: onCount, total: ALL_PANELS.length })}
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={onCount === ALL_PANELS.length}
                  onClick={() => setAll(true)}
                >
                  {t("share.all")}
                </Button>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={onCount === 0}
                  onClick={() => setAll(false)}
                >
                  {t("share.none")}
                </Button>
              </Group>
            }
          >
            <Stack gap={0}>
              {PANEL_GROUPS.map((g, i) => (
                <Box key={g.headingKey}>
                  {i > 0 && <Divider />}
                  <Box p="lg">
                    <Text size="xs" fw={650} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.04em" }}>
                      {t(g.headingKey)}
                    </Text>
                    {g.noteKey && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {t(g.noteKey)}
                      </Text>
                    )}
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="md">
                      {g.panels.map((p) => (
                        <Checkbox
                          key={p.key}
                          size="sm"
                          color="emerald"
                          label={t(`share.panel.${p.key}`)}
                          description={t(`share.panel.${p.key}Hint`)}
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

          <Section title={t("share.activity")} description={t("share.activityDesc")}>
            <Box p="lg">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
                  <Eye size={17} />
                </ThemeIcon>
                <div>
                  <Text fw={650}>
                    {views === 1
                      ? t("share.opensOne", { count: num(views) })
                      : t("share.opensOther", { count: num(views) })}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {data?.lastViewedAt
                      ? t("share.lastOpened", { ago: timeAgo(data.lastViewedAt) })
                      : t("share.notOpened")}
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
        title={t("share.neverShared")}
      >
        <Text size="sm">
          {t("share.neverSharedBody")}
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
  const { t } = useTranslation();
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
              {t("share.auditedAgo", { when: timeAgo(createdAt) })}
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
            {live ? t("share.live") : t("share.off")}
          </Badge>
          <Button
            size="compact-sm"
            variant={open ? "light" : "default"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? t("share.closeCard") : t("share.manage")}
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
  const { t } = useTranslation();
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
            <Text fw={650} mt={4}>{t("share.seoNoSitesTitle")}</Text>
            <Text c="dimmed" size="sm" ta="center">
              {t("share.seoNoSitesBody")}
            </Text>
          </Stack>
        </Center>
      </PageStack>
    );
  }

  return (
    <PageStack maxWidth={1080}>
      <Section
        title={t("share.seoSectionTitle")}
        description={t("share.seoSectionDesc")}
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
              {t("share.seoNoAudits")}
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
        title={t("share.seoNeverTitle")}
      >
        <Text size="sm">
          {t("share.seoNeverBody")}
        </Text>
      </Alert>
    </PageStack>
  );
}

/** Shown when there is no workspace to configure sharing for. */
function NoWorkspace() {
  const { t } = useTranslation();
  return (
    <Center py={64}>
      <Stack align="center" gap={8} maw={380}>
        <ThemeIcon variant="light" color="gray" size={48} radius="md">
          <Link2Off size={22} />
        </ThemeIcon>
        <Text fw={650} mt={4}>{t("share.noWorkspaceTitle")}</Text>
        <Text c="dimmed" size="sm" ta="center">
          {t("share.noWorkspaceBody")}
        </Text>
        <Button component="a" href="/app/workspaces" variant="light" mt="sm">
          {t("share.noWorkspaceCta")}
        </Button>
      </Stack>
    </Center>
  );
}

export default function Share() {
  const { t } = useTranslation();
  const { active } = useWorkspace();

  return (
    <AppShell>
      <PageHeader
        title={t("share.pageTitle")}
        description={t("share.pageDescription")}
        actions={<PageHelpButton />}
      />
      {active ? (
        <Tabs key={active._id} defaultValue="analytics" keepMounted={false}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="analytics" leftSection={<BarChart3 size={15} />}>
              {t("share.tabAnalytics")}
            </Tabs.Tab>
            <Tabs.Tab value="seo" leftSection={<Search size={15} />}>
              {t("share.tabSeo")}
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
