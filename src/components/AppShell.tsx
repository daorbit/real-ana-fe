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
  Settings as SettingsIcon, ChevronsUpDown, BookOpen, Share2,
} from "lucide-react";
import { Wordmark } from "./Brand";
import { SupportWidget } from "./SupportWidget";
import { useAuth } from "../auth";
import { notify, confirmLogout, errMessage } from "../notify";
import { useWorkspace } from "../workspace";
import { DemoToggle } from "./DemoToggle";
import { useDemo } from "../demo";
import { SwitchOverlay, useSwitchOverlay } from "./SwitchOverlay";

/**
 * Grouped navigation.
 *
 * A flat list of five items gives no sense of which are daily tools and which
 * are occasional setup — grouping costs one line of chrome and makes the shape
 * of the product visible.
 */
const NAV_GROUPS = [
  {
    heading: "Analyze",
    items: [
      { to: "/app", label: "Home", icon: Home },
      { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    heading: "Manage",
    items: [
      { to: "/app/workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/share", label: "Public dashboard", icon: Share2 },
      { to: "/app/developers", label: "Developers", icon: Code2 },
    ],
  },
];

/** Only an admin sees these, and only when not already acting as someone else. */
const ADMIN_ITEMS = [{ to: "/app/impersonate", label: "View as user", icon: Users }];

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
  const { user, logout, exitImpersonation } = useAuth();
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
    ? [...NAV_GROUPS, { heading: "Admin", items: ADMIN_ITEMS }]
    : NAV_GROUPS;

  const leave = async () => {
    setLeaving(true);
    try {
      await exitImpersonation();
      notify.info("Back to your own account.");
    } catch (e) {
      notify.error(errMessage(e, "Could not exit impersonation."));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <>
    {wsSwitch.active && active && (
      <SwitchOverlay
        label={active.name}
        sublabel="Loading workspace analytics"
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
          <Burger opened={navOpen} onClick={toggleNav} size="sm" aria-label="Toggle navigation" />
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
              aria-label="Active workspace"
            />
          </MantineShell.Section>
        )}

        <MantineShell.Section grow component={ScrollArea}>
          {groups.map((group) => (
            <Box key={group.heading} mb="md">
              <p className="nav-heading">{group.heading}</p>
              {group.items.map((n) => (
                <NavItem
                  key={n.to}
                  to={n.to}
                  label={n.label}
                  icon={n.icon}
                  active={loc.pathname === n.to}
                />
              ))}
            </Box>
          ))}
        </MantineShell.Section>

        <MantineShell.Section>
          {/* Docs, theme and the demo-data switch sit together as low-frequency
              utilities, so they don't compete with the primary nav above. */}
          <Group gap={4} mb="xs" px={2}>
            <Tooltip label="Documentation" withArrow>
              <ActionIcon
                component="a"
                href="https://quantalog.daorbit.in/docs"
                target="_blank"
                rel="noreferrer"
                variant="subtle"
                color="gray"
                aria-label="Documentation"
              >
                <BookOpen size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={dark ? "Light mode" : "Dark mode"} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setColorScheme(dark ? "light" : "dark")}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </ActionIcon>
            </Tooltip>
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
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<LogOut size={15} />}
                onClick={() =>
                  confirmLogout(() => {
                    logout();
                    notify.info("You have been logged out.");
                  })
                }
              >
                Log out
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
                  You are viewing as <b>{user?.email}</b> with full access — changes you
                  make are real.
                </Text>
                <Button
                  size="xs"
                  variant="white"
                  color="orange"
                  onClick={leave}
                  loading={leaving}
                  style={{ flexShrink: 0 }}
                >
                  Exit
                </Button>
              </Group>
            </Alert>
          )}

          {children}
        </div>
        {/* Clear the floating help button so page content never sits under it. */}
        <div style={{ height: 88 }} />
        <SupportWidget />
      </MantineShell.Main>
    </MantineShell>
    </>
  );
}
