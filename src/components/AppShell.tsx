import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, Select, Avatar, Group, Text, ActionIcon, ScrollArea,
  Box, useMantineColorScheme, useComputedColorScheme, Button, Alert, Menu,
  UnstyledButton, Tooltip, Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Home, BarChart3, FolderKanban, LogOut, Moon, Sun, Code2, Users, Eye,
  Settings as SettingsIcon, ChevronsUpDown, BookOpen, Share2, Search, PlayCircle,
  CreditCard,
} from "lucide-react";
import { Wordmark } from "./Brand";
import { SupportWidget } from "./SupportWidget";
import { useAuth } from "../auth";
import { notify, confirmLogout, errMessage } from "../notify";
import { useWorkspace } from "../workspace";
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
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
    ],
  },
];

/** Only an admin sees these, and only when not already acting as someone else. */
const ADMIN_ITEMS = [
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

  const impersonating = Boolean(user?.impersonating);
  // An impersonation session reports the target's role, so the admin nav would
  // vanish mid-impersonation anyway — but be explicit about it.
  const isAdmin = user?.role === "admin" && !impersonating;

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

        <MantineShell.Section grow component={ScrollArea}>
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

          <Menu position="right-end" withArrow radius="md" width={210}>
            <Menu.Target>
              <UnstyledButton
                className="tile"
                style={{ display: "block", width: "100%", padding: 8 }}
              >
                <Group gap="sm" wrap="nowrap">
                  <Avatar src={user?.avatarUrl || null} color="emerald" radius="md" size="md">
                    {initials}
                  </Avatar>
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
          {/* Full access means an accidental delete lands on a real customer.
              The banner is deliberately loud and always in reach. */}
          {impersonating && (
            <Alert color="orange" variant="filled" radius="md" mb="lg" icon={<Eye size={18} />}>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" fw={500}>
                  {t("nav.viewingAs")} <b>{user?.email}</b> {t("nav.viewingAsRest")}
                </Text>
                <Button
                  size="xs"
                  variant="white"
                  color="orange"
                  onClick={leave}
                  loading={leaving}
                  style={{ flexShrink: 0 }}
                >
                  {t("nav.exit")}
                </Button>
              </Group>
            </Alert>
          )}

          {/* Keyed on the path so the entrance animation replays on every
              navigation rather than only on first mount. */}
          <div key={loc.pathname} className="route-fade">
            {children}
          </div>
        </div>
        {/* Clear the floating help button so page content never sits under it. */}
        <div style={{ height: 88 }} />
        <SupportWidget />
      </MantineShell.Main>
    </MantineShell>
    </>
  );
}
