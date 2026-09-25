import {
  Text, Button, Stack, Center, ThemeIcon, Skeleton, Tabs, Select,
} from "@mantine/core";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Globe, Link2Off, Share2 } from "lucide-react";
import { SharePostModal } from "@/features/analytics/components/SharePostModal";
import type { ShareCardStats } from "@/features/analytics/components/shareCard";
import { AppShell } from "@/app/AppShell";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { RoleGate } from "@/features/billing/components/RoleGate";
import {
  useGetShareQuery, useSetShareMutation, useGetSitesQuery, useGetSeoReportsQuery,
  useGetSeoShareQuery,
} from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { useWorkspace } from "@/features/workspace/context";
import { timeAgo } from "@/shared/lib";
import { scoreColor } from "@/features/seo/components/ScoreRing";
import { SeoSharePanel } from "@/features/seo/components/SeoSharePanel";
import { SaveBarProvider, useSaveRegistration } from "@/shared/ui/SaveBar";
import type { SharePanels } from "@/shared/types";
import { ShareLinkCard } from "@/features/analytics/components/share/ShareLinkCard";
import { PanelSwitchList, type PanelGroup } from "@/features/analytics/components/share/PanelSwitchList";
import { LayoutPreview } from "@/features/analytics/components/share/LayoutPreview";
import { ShareFootnote } from "@/features/analytics/components/share/ShareFootnote";
import classes from "@/features/analytics/components/share/Share.module.css";

function SectionHead({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className={classes.sectionHead}>
      <div className={classes.sectionIntro}>
        <h2 className={classes.sectionTitle}>{title}</h2>
        {description && <p className={classes.sectionDesc}>{description}</p>}
      </div>
      {actions && <div className={classes.sectionActions}>{actions}</div>}
    </div>
  );
}
import { useTitle } from "@/shared/lib/useTitle";

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
const PUBLIC_API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * The headline numbers for the share card, read from the public endpoint using
 * the workspace's own token.
 *
 * Deliberately the public response rather than the owner's stats: what goes on
 * a card about to be posted publicly should be exactly what the link already
 * publishes. If the owner turned totals off, this returns zeros and the card
 * shows no figures — which is the correct outcome, not a bug.
 *
 * `count=1` is omitted so previewing a post does not inflate the open counter.
 */
function usePublicHeadline(token: string | null, enabled: boolean) {
  const [stats, setStats] = useState<ShareCardStats & { totals: boolean }>({
    visitors: 0, pageviews: 0, live: null, totals: false,
  });

  useEffect(() => {
    if (!token || !enabled) return;
    let cancelled = false;

    fetch(`${PUBLIC_API_BASE}/api/share/${token}?range=30d`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const totals = Boolean(d.panels?.totals);
        setStats({
          visitors: d.visitors ?? 0,
          pageviews: d.pageviews ?? 0,
          // The live figure only earns a tile when there is someone on the site
          // — a card reading "0 online" undersells a dashboard.
          live: totals && d.live > 0 ? d.live : null,
          totals,
        });
      })
      // A failed fetch leaves the zeros: the card still renders, just without
      // figures. Nothing here is worth interrupting the page for.
      .catch(() => {});

    return () => { cancelled = true; };
  }, [token, enabled]);

  return stats;
}

function ShareSettings({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetShareQuery(workspaceId);
  const { active } = useWorkspace();
  const { user } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [setShare] = useSetShareMutation();
  // The mutation's shared `isLoading` would light up the link toggle and
  // New-link spinners during a panel-save, so the instant link actions
  // (enable/rotate) carry their own flag.
  const [linkBusy, setLinkBusy] = useState(false);

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const views = data?.views ?? 0;
  const url = token ? `${window.location.origin}/share/${token}` : "";
  const headline = usePublicHeadline(token, enabled);

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
    trace(user?.id, "share_panels_saved", "share", "analytics");
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
    trace(user?.id, "share_link_toggled", "share", next ? "enabled" : "disabled");
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
        trace(user?.id, "share_link_rotated", "share", "new_link");
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

  const groups: PanelGroup<keyof SharePanels>[] = PANEL_GROUPS.map((g) => ({
    heading: t(g.headingKey),
    note: g.noteKey ? t(g.noteKey) : undefined,
    panels: g.panels.map((p) => ({
      key: p.key,
      label: t(`share.panel.${p.key}`),
      hint: t(`share.panel.${p.key}Hint`),
    })),
  }));

  if (isLoading) {
    return (
      <div className={classes.stack}>
        <Skeleton height={132} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    );
  }

  return (
    <div className={classes.stack}>
      <ShareLinkCard
        title={t("share.analyticsLinkTitle")}
        description={enabled ? t("share.liveHint") : t("share.offHint")}
        enabled={enabled}
        busy={linkBusy}
        onToggle={toggle}
        url={enabled && token ? url : ""}
        views={views}
        lastViewedAt={data?.lastViewedAt}
        onReplace={rotate}
        primaryAction={
          // Share, not Copy: copying is already on the link itself, and the
          // thing an owner does with a fresh public link is post it somewhere.
          <Button
            onClick={() => {
              trace(user?.id, "share_composer_opened", "share", "composer");
              setComposerOpen(true);
            }}
            leftSection={<Share2 size={14} />}
            style={{ flexShrink: 0 }}
          >
            {t("share.share")}
          </Button>
        }
        offContent={
          <div className={classes.offBody}>
            <span>{t("share.offIntro")}</span>
            <Button size="sm" onClick={() => toggle(true)} loading={linkBusy}>
              {t("share.turnOn")}
            </Button>
          </div>
        }
      />

      {enabled && token && (
        // What the viewer sees is the owner's call — page paths in particular
        // can carry internal URLs they never meant to publish.
        <section>
          <SectionHead
            title={t("share.whatVisitorsSee")}
            description={t("share.whatVisitorsSeeDesc")}
            actions={
              <>
                <span>{t("share.onOf", { on: onCount, total: ALL_PANELS.length })}</span>
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
              </>
            }
          />
          <div className={classes.visibility}>
            <PanelSwitchList groups={groups} values={panels} onToggle={togglePanel} />
            <div className={classes.previewCol}>
              <div className={classes.previewHead}>
                <span className={classes.groupTitle}>{t("share.previewTitle")}</span>
                <span className={classes.switchHint}>{t("share.previewDesc")}</span>
              </div>
              <LayoutPreview panels={panels} workspace={active?.name ?? ""} />
            </div>
          </div>
        </section>
      )}

      <ShareFootnote title={t("share.neverShared")} body={t("share.neverSharedBody")} />

      {token && (
        <SharePostModal
          opened={composerOpen}
          onClose={() => setComposerOpen(false)}
          workspaceId={workspaceId}
          workspace={active?.name ?? ""}
          url={url}
          shareUrl={`${PUBLIC_API_BASE || window.location.origin}/api/share/${token}/preview`}
          rangeLabel={t("share.cardRange")}
          stats={{
            visitors: headline.visitors,
            pageviews: headline.pageviews,
            live: headline.live,
          }}
        />
      )}
    </div>
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
  /** Starts open when it is the only audit, so its controls need no click. */
  defaultOpen?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const { data } = useGetSeoShareQuery({ workspaceId, siteId, reportId });
  const live = Boolean(data?.enabled);
  const tone = `var(--mantine-color-${scoreColor(score)}-6)`;

  return (
    <div className={classes.auditRow}>
      <button type="button" className={classes.auditHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span
          className={classes.score}
          style={{ color: tone, background: `color-mix(in srgb, ${tone} 14%, transparent)` }}
        >
          {score}
        </span>
        <span className={classes.auditText}>
          <span className={classes.auditUrl}>{prettyUrl(url)}</span>
          <span className={classes.auditMeta}>{t("share.auditedAgo", { when: timeAgo(createdAt) })}</span>
        </span>
        <span className={classes.statusPill} data-live={live || undefined}>
          <span className={classes.statusDot} />
          {live ? t("share.live") : t("share.off")}
        </span>
        <ChevronRight size={16} className={classes.chevron} data-open={open || undefined} />
      </button>

      {/* Kept mounted while collapsed so an unsaved draft and its Save-bar
          registration survive closing the row. */}
      <div className={classes.auditBody} style={{ display: open ? undefined : "none" }}>
        <SeoSharePanel workspaceId={workspaceId} siteId={siteId} reportId={reportId} />
      </div>
    </div>
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
  // `currentData` — see the note in Seo.tsx: `data` survives the workspace
  // switch and would list sites this workspace does not own.
  const { currentData: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
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
      <div className={classes.stack}>
        <Skeleton height={80} radius="md" />
        <Skeleton height={200} radius="md" />
      </div>
    );
  }

  if (!sites.length) {
    return (
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
    );
  }

  return (
    <div className={classes.stack}>
      <section>
        <SectionHead
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
                aria-label="Site"
              />
            )
          }
        />
        {reportsLoading ? (
          <Skeleton height={120} radius="md" />
        ) : latestPerUrl.length === 0 ? (
          <div className={classes.card}>
            <Text size="sm" c="dimmed" p="lg">
              {t("share.seoNoAudits")}
            </Text>
          </div>
        ) : (
          <div className={classes.card}>
            {latestPerUrl.map((r) => (
              <AuditShareCard
                key={r._id}
                workspaceId={workspaceId}
                siteId={activeSiteId}
                reportId={r._id}
                url={r.url}
                score={r.score}
                createdAt={r.createdAt}
                defaultOpen={latestPerUrl.length === 1}
              />
            ))}
          </div>
        )}
      </section>

      <ShareFootnote title={t("share.seoNeverTitle")} body={t("share.seoNeverBody")} />
    </div>
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
  useTitle("Public dashboard");
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "seo" ? "seo" : "analytics";
  const { data: share } = useGetShareQuery(active?._id ?? "", { skip: !active });

  const setTab = (next: string | null) =>
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        if (next === "seo") out.set("tab", "seo");
        else out.delete("tab");
        return out;
      },
      { replace: true },
    );

  return (
    <AppShell>
      <PageHeader
        title={t("share.pageTitle")}
        description={t("share.pageDescription")}
        docsPath="/public-dashboards"
        actions={<PageHelpButton />}
      />
      {active ? (
        <RoleGate minimum="admin" what="Only admins can manage public sharing.">
          <Tabs
            key={active._id}
            value={tab}
            onChange={setTab}
            keepMounted={false}
            classNames={{ list: classes.tabList, tab: classes.tab }}
          >
            <Tabs.List>
              <Tabs.Tab value="analytics">
                {t("share.tabAnalyticsLong")}
                {share?.enabled && <span className={classes.tabDot} aria-label={t("share.live")} />}
              </Tabs.Tab>
              <Tabs.Tab value="seo">{t("share.tabSeoLong")}</Tabs.Tab>
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
        </RoleGate>
      ) : (
        <NoWorkspace />
      )}
    </AppShell>
  );
}
