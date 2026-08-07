import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, Select, Group, Text, ActionIcon, ScrollArea,
  Box, useMantineColorScheme, useComputedColorScheme, Button, Menu,
  UnstyledButton, Tooltip, Burger, Progress, Badge, ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  Home, BarChart3, FolderKanban, LogOut, Moon, Sun, Code2, Users, Eye,
  Settings as SettingsIcon, ChevronsUpDown, BookOpen, Share2, Search, PlayCircle, CalendarClock,
  CreditCard, ArrowUpRight, Mail, Inbox, UserPlus,
} from "lucide-react";
import { PlanIcon } from "./PlanIcons";
import { UserAvatar } from "./UserAvatar";
import { Wordmark } from "./Brand";
import { SupportWidget } from "./SupportWidget";
import { useAuth, useIsPlatformAdmin } from "../auth";
import { notify, confirmLogout, errMessage } from "../notify";
import { useWorkspace, useActiveBilling } from "../workspace";
import { DemoToggle } from "./DemoToggle";
import { useDemo } from "../demo";
import { SwitchOverlay, useSwitchOverlay } from "./SwitchOverlay";
import { CommandPalette } from "./CommandPalette";
import { LanguagePicker } from "./LanguagePicker";
import { useTranslation } from "react-i18next";

/**
 * Grouped navigation.
 *
 * A flat list of five items gives no sense of which are daily tools and which
 * are occasional setup — grouping costs one line of chrome and makes the shape
 * of the product visible.
 */
// `labelKey` is an i18n key resolved at render, so the rail follows the chosen
// language. `headingKey` likewise. Items without a shipped key (Public
// dashboard, admin-only) fall back to their English label via a plain string.
const NAV_GROUPS = [
  {
    headingKey: "nav.groupAnalyze",
    heading: "Analyze",
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home },
      { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
    ],
  },
  {
    headingKey: "nav.groupManage",
    heading: "Manage",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users },
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
    ],
  },
];

/**
 * Only an admin sees these, and only when not already acting as someone else.
 *
 * "Send a message" and "Contact messages" were almost the same words for
 * opposite directions — one mails every user, the other is where users' mail
 * arrives. The labels now name the direction rather than the medium, and the
 * inbox sits first because it is the one with unread work in it.
 */
const ADMIN_ITEMS = [
  { to: "/app/admin/contact", labelKey: "nav.adminContact", label: "Inbox", icon: Inbox },
  { to: "/app/admin/broadcast", labelKey: "nav.adminBroadcast", label: "Email users", icon: Mail },
  { to: "/app/impersonate", labelKey: "nav.viewAsUser", label: "Impersonate", icon: Users },
  { to: "/app/demo-usage", labelKey: "nav.demoUsage", label: "Demo usage", icon: PlayCircle },
  { to: "/app/admin/billing", labelKey: "nav.adminBilling", label: "Plans & addons", icon: CreditCard },
];

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <UnstyledButton
      component={Link}
      to={to}
      className="nav-link"
      data-active={active}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 10px",
        marginBottom: 2,
        color: active ? "var(--text)" : "var(--text-2)",
      }}
    >
      <Icon size={17} style={{ flexShrink: 0, color: active ? "var(--violet-2)" : undefined }} />
      <Text size="sm" fw={active ? 600 : 500} truncate>
        {label}
      </Text>
    </UnstyledButton>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user, logout, exitImpersonation, isDemo } = useAuth();
  const { workspaces, active, setActive } = useWorkspace();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const loc = useLocation();
  const dark = scheme === "dark";

  const [leaving, setLeaving] = useState(false);

  // Matches the shell's `breakpoint: "sm"` — below this the navbar is a
  // slide-over rather than a permanent rail, which changes where popovers
  // anchored to it can open without falling off the screen.
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;

  const impersonating = Boolean(user?.impersonating);
  // Super-admin only, and never while impersonating — see `useIsPlatformAdmin`.
  const isAdmin = useIsPlatformAdmin();

  const { demo } = useDemo();

  // Switching workspace re-renders every panel with a different dataset at
  // once. The overlay covers that swap; it never gates the fetch.
  const wsSwitch = useSwitchOverlay(active?._id ?? null);

  // Mobile nav drawer. The navbar is a permanent rail on desktop and a
  // slide-over on phones — close it on every navigation so a tap on a link
  // doesn't leave the overlay covering the page it just opened.
  const [navOpen, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  useEffect(() => {
    closeNav();
  }, [loc.pathname, closeNav]);

  const initials = (user?.firstName || user?.name || "?").slice(0, 2).toUpperCase();

  const groups = isAdmin
    ? [...NAV_GROUPS, { headingKey: "nav.groupAdmin", heading: "Admin", items: ADMIN_ITEMS }]
    : NAV_GROUPS;

  const leave = async () => {
    setLeaving(true);
    try {
      await exitImpersonation();
      notify.info(t("nav.backToAccount"));
    } catch (e) {
      notify.error(errMessage(e, t("nav.exitImpersonationError")));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <>
    <CommandPalette />
    {wsSwitch.active && active && (
      <SwitchOverlay
        label={active.name}
        sublabel={t("nav.loadingWorkspace")}
        onDone={wsSwitch.dismiss}
      />
    )}
    <MantineShell
      header={{ height: { base: 56, sm: 0 } }}
      navbar={{
        width: 252,
        breakpoint: "sm",
        collapsed: { mobile: !navOpen },
      }}
      padding="lg"
    >
      {/* Mobile-only top bar. Hidden on desktop (header collapsed there), it
          carries the burger and brand so the navbar can slide away on phones. */}
      <MantineShell.Header
        px="md"
        hiddenFrom="sm"
        style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}
      >
        <Group h="100%" gap="sm">
          <Burger opened={navOpen} onClick={toggleNav} size="sm" aria-label={t("nav.toggleNav")} />
          <Box component={Link} to="/app" display="flex">
            <Wordmark />
          </Box>
        </Group>
      </MantineShell.Header>

      <MantineShell.Navbar
        p="sm"
        style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}
      >
        {/* On mobile the wordmark already sits in the top bar, so the one here
            would double up inside the open drawer — desktop-only. */}
        <MantineShell.Section visibleFrom="sm">
          <Box component={Link} to="/app" px={6} pt={6} pb="md" display="block">
            <Wordmark />
          </Box>
        </MantineShell.Section>

        {workspaces.length > 0 && (
          <MantineShell.Section mb="md">
            <Select
              size="sm"
              radius="md"
              data={workspaces.map((w) => ({ value: w._id, label: w.name }))}
              value={active?._id ?? null}
              onChange={(v) => v && setActive(v)}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true, radius: "md" }}
              leftSection={<FolderKanban size={15} />}
              rightSection={<ChevronsUpDown size={14} />}
              aria-label={t("nav.activeWorkspace")}
            />
          </MantineShell.Section>
        )}

        {/* The palette is keyboard-only, so it needs somewhere visible that
            says it exists. Clicking dispatches the same shortcut. */}
        <MantineShell.Section mb="md">
          <UnstyledButton
            className="tile"
            style={{ display: "block", width: "100%", padding: "7px 10px" }}
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              )
            }
          >
            <Group gap="xs" wrap="nowrap">
              <Search size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <Text size="sm" c="dimmed">{t("nav.search")}</Text>
              <kbd className="kbd" style={{ marginLeft: "auto" }}>Ctrl K</kbd>
            </Group>
          </UnstyledButton>
        </MantineShell.Section>

        {/* `type="never"` hides the scrollbar without disabling the scrolling —
            the rail still scrolls by wheel and trackpad, it just stops drawing a
            track down the middle of the navigation. */}
        <MantineShell.Section grow component={ScrollArea} type="never">
          {groups.map((group) => (
            <Box key={group.heading} mb="md">
              <p className="nav-heading">{t(group.headingKey, group.heading)}</p>
              {group.items.map((n) => (
                <NavItem
                  key={n.to}
                  to={n.to}
                  label={t(n.labelKey, n.label)}
                  icon={n.icon}
                  active={loc.pathname === n.to}
                />
              ))}
            </Box>
          ))}
        </MantineShell.Section>

        <MantineShell.Section>
          {/* Full access means an accidental delete lands on a real customer,
              so the session stays flagged for as long as it lasts. It sits with
              the demo card, directly above the account it is standing in for —
              a banner over the page pushed every screen down to say something
              that never changes. */}
          {impersonating && (
            <Box className="impersonation-card" mb="xs">
              <Group gap={6} wrap="nowrap" mb={4}>
                <Eye size={12} style={{ color: "var(--amber)", flexShrink: 0 }} />
                <Text size="xs" fw={650}>{t("nav.viewingAs")}</Text>
              </Group>
              <Text size="xs" c="dimmed" lh={1.4} truncate title={user?.email}>
                {user?.email}
              </Text>
              <UnstyledButton className="impersonation-exit" onClick={leave} disabled={leaving}>
                <LogOut size={11} />
                {t("nav.exit")}
              </UnstyledButton>
            </Box>
          )}

          {!isDemo && <PendingInviteCard />}
          {!isDemo && <PlanCard />}

          {/* Read-only demo session. A persistent card, not a toast, because it
              explains why every action is disabled — and it's the way out. */}
          {isDemo && (
            <Box className="demo-card" mb="xs">
              <Group gap={6} wrap="nowrap" mb={4}>
                <PlayCircle size={12} style={{ color: "var(--violet-2)", flexShrink: 0 }} />
                <Text size="xs" fw={650}>{t("nav.demoMode")}</Text>
              </Group>
              <Text size="xs" c="dimmed" lh={1.4}>
                {t("nav.demoBlurb")}
              </Text>
              <UnstyledButton
                className="demo-exit"
                onClick={logout}
              >
                <LogOut size={11} />
                {t("nav.exitDemo")}
              </UnstyledButton>
            </Box>
          )}

          <Group gap={4} mb="xs" px={2}>
            <Tooltip label={t("nav.documentation")} withArrow>
              <ActionIcon
                component="a"
                href="https://quantalog.daorbit.in/docs"
                target="_blank"
                rel="noreferrer"
                variant="subtle"
                color="gray"
                aria-label={t("nav.documentation")}
              >
                <BookOpen size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={dark ? t("nav.lightMode") : t("nav.darkMode")} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setColorScheme(dark ? "light" : "dark")}
                aria-label={dark ? t("nav.switchToLight") : t("nav.switchToDark")}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </ActionIcon>
            </Tooltip>
            <LanguagePicker />
            <DemoToggle />
          </Group>

          {/* On desktop the account menu opens beside the rail. On a phone the
              rail is a full-height slide-over pinned to the left edge, so
              `right-end` put the dropdown — and the Log out item in it —
              partly off-screen with no way to reach it. Opening upward over
              the rail keeps it on screen at any width, and `withinPortal`
              stops the navbar's own scroll container from clipping it. */}
          <Menu
            position={mobile ? "top" : "right-end"}
            withArrow
            radius="md"
            width={mobile ? "target" : 210}
            withinPortal
            zIndex={400}
          >
            <Menu.Target>
              <UnstyledButton
                className="tile"
                style={{ display: "block", width: "100%", padding: 8 }}
              >
                <Group gap="sm" wrap="nowrap">
                  <UserAvatar src={user?.avatarUrl} color="emerald" radius="md" size="md">
                    {initials}
                  </UserAvatar>
                  <Box style={{ flex: 1, overflow: "hidden" }}>
                    <Text size="sm" fw={600} truncate>{user?.name}</Text>
                    <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
                  </Box>
                  <ChevronsUpDown size={14} style={{ flexShrink: 0, color: "var(--muted)" }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                to="/app/settings"
                leftSection={<SettingsIcon size={15} />}
              >
                {t("nav.settings")}
              </Menu.Item>
              <Menu.Divider />
              {/* Mantine fills a coloured menu item solid on hover, which for a
                  destructive-red item reads as an alert rather than a hover
                  state. `danger-item` tints it instead — see polish.css. */}
              <Menu.Item
                color="red"
                className="danger-item"
                leftSection={<LogOut size={15} />}
                onClick={() =>
                  confirmLogout(() => {
                    logout();
                    notify.info(t("nav.loggedOut"));
                  })
                }
              >
                {t("nav.logout")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </MantineShell.Section>
      </MantineShell.Navbar>

      <MantineShell.Main style={{ background: "var(--bg)", position: "relative" }}>
        {/* A hairline along the top of the content while demo mode is on.
            Every number below it is fabricated, and the sidebar switch is easy
            to forget once scrolled away from — this costs no layout space and
            is visible from anywhere on the page. */}
        {demo && (
          <Box
            aria-hidden
            style={{
              position: "fixed",
              insetInline: 0,
              top: 0,
              height: 2,
              background: "var(--mantine-color-violet-5)",
              zIndex: 200,
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Keyed on the path so the entrance animation replays on every
              navigation rather than only on first mount. */}
          <div key={loc.pathname} className="route-fade">
            {children}
          </div>
        </div>
        {/* Clear the floating help button so page content never sits under it.
            The height tracks the button's size, which steps down on phones. */}
        <div className="support-fab-spacer" />
        <SupportWidget />
      </MantineShell.Main>
    </MantineShell>
    </>
  );
}

/**
 * Which plan the account is on, and how close it is to the plan's limits —
 * always visible in the rail rather than something you find only by opening
 * Billing. The nudge to upgrade is deliberately quiet on Free/plenty-of-room
 * (a plain badge) and gets louder (a card with a bar and a button) once a
 * quota is actually close to biting, so it reads as useful information most
 * of the time and only becomes a prompt when there's something to act on.
 */
/**
 * "You've been invited to X" in the rail.
 *
 * An invitation that arrives while someone is already using the app would
 * otherwise only exist in their inbox — and an email is easy to miss when the
 * thing it grants access to is already open in a tab.
 */
function PendingInviteCard() {
  const { user } = useAuth();
  const invites = user?.pendingInvites ?? [];
  if (!invites.length) return null;

  // One at a time. Someone with three outstanding invitations still accepts
  // them one by one, and a stack of cards would crowd out the navigation.
  const [invite] = invites;

  return (
    <UnstyledButton
      component={Link}
      to={`/invite/${invite.token}`}
      className="tile"
      style={{ display: "block", width: "100%", padding: "10px 12px", marginBottom: 8 }}
    >
      <Group gap={8} wrap="nowrap" align="flex-start">
        <ThemeIcon size={20} radius="xl" variant="light" color="emerald">
          <UserPlus size={11} />
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" fw={600} lh={1.3}>
            You&apos;ve been invited
          </Text>
          <Text size="xs" c="dimmed" lh={1.35} truncate>
            {invite.workspaceName} · {invite.role}
          </Text>
          {invites.length > 1 && (
            <Text size="xs" c="dimmed" lh={1.35}>
              +{invites.length - 1} more
            </Text>
          )}
        </div>
      </Group>
    </UnstyledButton>
  );
}

function PlanCard() {
  // The active workspace's plan, not the account's — plans are bought per
  // workspace, so the rail reports whichever one is on screen.
  const billing = useActiveBilling();
  if (!billing) return null;

  const expired = billing.status === "expired";

  // The tightest of the two usage ratios is what decides whether this nudges
  // — a plan can have plenty of crawl headroom left while audits are nearly
  // exhausted, and that's the number that should drive the warning.
  const auditPct = billing.audits.planQuota > 0
    ? billing.audits.used / billing.audits.planQuota
    : 1;
  const crawlPct = billing.crawls.planQuota > 0
    ? billing.crawls.used / billing.crawls.planQuota
    : 1;
  const worstPct = Math.max(auditPct, crawlPct);
  const nearLimit = worstPct >= 0.8 && billing.audits.addonCredits === 0 && billing.crawls.addonCredits === 0;

  const nudge = expired || nearLimit;

  if (!nudge) {
    return (
      <UnstyledButton
        component={Link}
        to="/app/billing"
        className="tile"
        style={{ display: "block", width: "100%", padding: "8px 10px", marginBottom: 8 }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <PlanIcon slug={billing.plan.slug} size={16} uid="rail" />
            <Text size="xs" fw={600} truncate>{billing.plan.name} plan</Text>
          </Group>
          <Badge size="xs" variant="light" color="gray" tt="none">{billing.cycle}</Badge>
        </Group>
      </UnstyledButton>
    );
  }

  return (
    <Box className="tile" style={{ padding: 10, marginBottom: 8 }}>
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Group gap={6} wrap="nowrap">
          <PlanIcon slug={billing.plan.slug} size={16} uid="rail-warn" />
          <Text size="xs" fw={650}>{billing.plan.name} plan</Text>
        </Group>
        {expired && (
          <Badge size="xs" variant="light" color="red" tt="none">expired</Badge>
        )}
      </Group>

      {expired ? (
        <Text size="xs" c="dimmed" lh={1.4} mb={8}>
          Your period ended — audits and crawls are paused until you renew.
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed" lh={1.4} mb={6}>
            You've used {billing.audits.used}/{billing.audits.planQuota} audits and{" "}
            {billing.crawls.used}/{billing.crawls.planQuota} crawls this cycle.
          </Text>
          <Progress value={worstPct * 100} size={4} radius="xl" color="yellow" mb={8} />
        </>
      )}

      <Button
        component={Link}
        to="/app/billing"
        size="compact-xs"
        fullWidth
        color={expired ? "red" : "emerald"}
        variant={expired ? "filled" : "light"}
        rightSection={<ArrowUpRight size={12} />}
      >
        {expired ? "Renew plan" : "Upgrade plan"}
      </Button>
    </Box>
  );
}
