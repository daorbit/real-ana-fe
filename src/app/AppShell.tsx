import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, Select, Group, Text, ScrollArea,
  Box, useMantineColorScheme, useComputedColorScheme, Button, Menu,
  UnstyledButton, Burger, Progress, Badge, ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  Home, BarChart3, FolderKanban, LogOut, Moon, Sun, Code2, Users, Eye,
  Settings as SettingsIcon, ChevronsUpDown, BookOpen, Share2, Search, PlayCircle, CalendarClock,
  Send,
  CreditCard, ArrowUpRight, Mail, Inbox, UserPlus, LifeBuoy, Swords,
  Languages, FlaskConical,
} from "lucide-react";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { Wordmark } from "@/shared/ui/Brand";
import { OrbitBubble } from "@/features/orbit/components/OrbitBubble";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { notify, confirmLogout, errMessage } from "@/shared/lib/notify";
import { useWorkspace, useActiveBilling } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { SwitchOverlay, useSwitchOverlay } from "@/shared/ui/SwitchOverlay";
import { useSyncWorkspaceTheme } from "@/features/auth/components/useSyncWorkspaceTheme";
import { CommandPalette } from "@/shared/ui/CommandPalette";
import { LanguageItems } from "@/lib/i18n/LanguagePicker";
import { useTranslation } from "react-i18next";

 
const NAV_GROUPS = [
  {
    headingKey: "nav.groupAnalyze",
    heading: "Analyze",
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home },
      { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
      // Beside SEO rather than inside it: an audit is a snapshot of one URL,
      // while a comparison is a set of rivals watched over time.
      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords },
      // { to: "/app/forms", labelKey: "nav.forms", label: "Lead forms", icon: FileText },
    ],
  },
  {
    headingKey: "nav.groupManage",
    heading: "Manage",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
      // Beside Reports: both are "write it once, it goes out on a schedule".
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
    ],
  },
];

 
const ACCOUNT_ITEMS = [
  { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users },
  { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
  { to: "/app/help", labelKey: "nav.help", label: "Help & support", icon: LifeBuoy },
];

 
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

  const { demo, available: demoAvailable, toggle: toggleDemo } = useDemo();

  // Switching workspace re-renders every panel with a different dataset at
  // once. The overlay covers that swap; it never gates the fetch.
  const wsSwitch = useSwitchOverlay(active?._id ?? null);

  // Pulls the active workspace's saved Appearance and applies it — see the
  // hook for why this is additive to localStorage rather than the only
  // source of truth.
  useSyncWorkspaceTheme(active?._id);

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
      /* The gap between the rail and the panel, and the panel's inset from the
         window edge. Kept tight — this is a frame, not a margin, and every
         pixel here is taken from the content the panel exists to show. */
      padding="xs"
    >
      {/* Mobile-only top bar. Hidden on desktop (header collapsed there), it
          carries the burger and brand so the navbar can slide away on phones. */}
      <MantineShell.Header
        px="md"
        hiddenFrom="sm"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <Group h="100%" gap="sm">
          <Burger opened={navOpen} onClick={toggleNav} size="sm" aria-label={t("nav.toggleNav")} />
          <Box component={Link} to="/app" display="flex">
            <Wordmark />
          </Box>
        </Group>
      </MantineShell.Header>

 
      {/* The same surface as the content panel, so the two read as one app
          divided by a hairline rather than as two different greys. Flat all the
          same — no radius, border or shadow of its own; the panel beside it is
          what carries the frame. */}
      <MantineShell.Navbar p="sm" style={{ background: "var(--shell)", border: "none" }}>
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

 
          <Menu
            position={mobile ? "top" : "right-end"}
            withArrow
            radius="md"
            width={mobile ? "target" : 250}
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

            <AccountMenuDropdown
              email={user?.email ?? ""}
              name={user?.name ?? ""}
              avatarUrl={user?.avatarUrl}
              initials={initials}
              dark={dark}
              onToggleScheme={() => setColorScheme(dark ? "light" : "dark")}
              demo={demo}
              demoAvailable={demoAvailable}
              onToggleDemo={toggleDemo}
              onLogout={() =>
                confirmLogout(() => {
                  logout();
                  notify.info(t("nav.loggedOut"));
                })
              }
            />
          </Menu>
        </MantineShell.Section>
      </MantineShell.Navbar>

 
      <MantineShell.Main className="app-main" style={{ position: "relative" }}>
     
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

        <div className="app-panel">
          <div className="app-panel__scroll">
            {/* Keyed on the path so the entrance animation replays on every
                navigation rather than only on first mount. */}
            <div key={loc.pathname} className="route-fade">
              {children}
            </div>
            {/* Clear the floating help button so page content never sits under
                it. The height tracks the button's size, which steps down on
                phones. */}
            <div className="orbit-fab-spacer" />
          </div>

          {/* Inside the panel rather than the viewport: it is anchored to the
              content's own bottom-right corner, and pinned to the window it
              would have floated over the panel's edge. */}
          <OrbitBubble />
        </div>
      </MantineShell.Main>
    </MantineShell>
    </>
  );
}

 
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
 
function AccountMenuDropdown({
  email,
  name,
  avatarUrl,
  initials,
  dark,
  onToggleScheme,
  demo,
  demoAvailable,
  onToggleDemo,
  onLogout,
}: {
  email: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  dark: boolean;
  onToggleScheme: () => void;
  demo: boolean;
  /** Admin-only — the demo row is absent entirely for everyone else. */
  demoAvailable: boolean;
  onToggleDemo: (next: boolean) => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Menu.Dropdown>
      <Box className="account-menu__header">
        {/* The face as well as the address: this menu is opened to check which
            account is active, and on a shared machine the avatar answers that
            faster than an email string does. */}
        <Group gap="sm" wrap="nowrap">
          <UserAvatar src={avatarUrl} color="emerald" radius="md" size="md">
            {initials}
          </UserAvatar>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600} truncate title={name}>{name}</Text>
            <Text size="xs" c="dimmed" truncate title={email}>{email}</Text>
          </Box>
        </Group>

        {/* Workspace, plan and the billing button used to sit here. They are
            gone deliberately: the sidebar already carries a persistent plan
            card, so this menu was saying the same thing twice, and the header
            reads as an account identity block rather than a billing panel. */}
      </Box>

      {/* No divider here: the header carries its own bottom border now, and
          the two together read as a double rule. */}
      <Menu.Item component={Link} to="/app/settings" leftSection={<SettingsIcon size={15} />}>
        {t("nav.settings")}
      </Menu.Item>
      {ACCOUNT_ITEMS.map((item) => (
        <Menu.Item
          key={item.to}
          component={Link}
          to={item.to}
          leftSection={<item.icon size={15} />}
        >
          {t(item.labelKey, item.label)}
        </Menu.Item>
      ))}

      <Menu.Divider />

      {/* Named rather than a glyph, and stating what it will switch *to* —
          a moon captioned only by its own icon leaves you guessing whether it
          shows the current mode or the one it moves to. */}
      <Menu.Item
        leftSection={dark ? <Sun size={15} /> : <Moon size={15} />}
        onClick={onToggleScheme}
        closeMenuOnClick={false}
      >
        {dark ? t("nav.lightMode") : t("nav.darkMode")}
      </Menu.Item>

      {/* A submenu, because the language list is long enough that inlining it
          would bury everything below it. */}
      <Menu.Sub>
        <Menu.Sub.Target>
          <Menu.Sub.Item leftSection={<Languages size={15} />}>
            {t("nav.language")}
          </Menu.Sub.Item>
        </Menu.Sub.Target>
        <Menu.Sub.Dropdown>
          <LanguageItems />
        </Menu.Sub.Dropdown>
      </Menu.Sub>

      {/* Admin-only: renders nothing when demo data is not available. */}
      {demoAvailable && (
        <Menu.Item
          leftSection={<FlaskConical size={15} />}
          rightSection={
            demo ? <Badge size="xs" variant="light" color="violet" tt="none">on</Badge> : null
          }
          onClick={() => onToggleDemo(!demo)}
          closeMenuOnClick={false}
        >
          {t("nav.demoData", "Demo data")}
        </Menu.Item>
      )}

      <Menu.Item
        component="a"
        href="https://quantalog.daorbit.in/docs"
        target="_blank"
        rel="noreferrer"
        leftSection={<BookOpen size={15} />}
      >
        {t("nav.documentation")}
      </Menu.Item>

      <Menu.Divider />

      {/* Mantine fills a coloured menu item solid on hover, which for a
          destructive-red item reads as an alert rather than a hover state.
          `danger-item` tints it instead — see polish.css. */}
      <Menu.Item
        color="red"
        className="danger-item"
        leftSection={<LogOut size={15} />}
        onClick={onLogout}
      >
        {t("nav.logout")}
      </Menu.Item>
    </Menu.Dropdown>
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

        {/* No usage bar while there is room: unlabelled, it reads as a stray
            rule under the plan name rather than as a quota, and the card that
            replaces this one the moment a limit is close says it in words. */}
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
