import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, NavLink, Select, Avatar, Group, Text, ActionIcon, ScrollArea, Box,
  useMantineColorScheme, SegmentedControl, Center, useComputedColorScheme, Button, Alert,
} from "@mantine/core";
import {
  Home, BarChart3, FolderKanban, LogOut, Moon, Sun, Code2, Users, Eye,
  Settings as SettingsIcon,
} from "lucide-react";
import { Wordmark } from "./Brand";
import { SupportWidget } from "./SupportWidget";
import { useAuth } from "../auth";
import { notify, confirmLogout, errMessage } from "../notify";
import { useWorkspace } from "../workspace";

const NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/workspaces", label: "Workspaces", icon: FolderKanban },
  { to: "/app/developers", label: "Developers", icon: Code2 },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

/** Only an admin sees these, and only when not already acting as someone else. */
const ADMIN_NAV = [
  { to: "/app/impersonate", label: "View as user", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, exitImpersonation } = useAuth();
  const { workspaces, active, setActive } = useWorkspace();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const loc = useLocation();
  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();
  const dark = scheme === "dark";

  const [leaving, setLeaving] = useState(false);

  const impersonating = Boolean(user?.impersonating);
  // An impersonation session reports the target's role, so the admin nav would
  // vanish mid-impersonation anyway — but be explicit about it.
  const isAdmin = user?.role === "admin" && !impersonating;

  const nav = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

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
    <MantineShell
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="lg"
    >
      <MantineShell.Navbar p="md" style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}>
        <MantineShell.Section>
          <Box component={Link} to="/app" px={4} pt={4} pb="lg" display="block">
            <Wordmark />
          </Box>
        </MantineShell.Section>

        {workspaces.length > 0 && (
          <MantineShell.Section mb="lg">
            <Select
              label="Workspace"
              size="sm"
              radius="md"
              data={workspaces.map((w) => ({ value: w._id, label: w.name }))}
              value={active?._id ?? null}
              onChange={(v) => v && setActive(v)}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true, radius: "md" }}
              styles={{ label: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 6, fontWeight: 600 } }}
            />
          </MantineShell.Section>
        )}

        <MantineShell.Section grow component={ScrollArea}>
          {nav.map((n) => {
            const isActive = loc.pathname === n.to;
            return (
              <NavLink
                key={n.to}
                component={Link}
                to={n.to}
                label={<Text fw={isActive ? 600 : 500} size="sm">{n.label}</Text>}
                leftSection={<n.icon size={18} />}
                active={isActive}
                variant="filled"
                mb={6}
                styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
              />
            );
          })}
        </MantineShell.Section>

        <MantineShell.Section>
          <SegmentedControl
            fullWidth
            size="sm"
            radius="md"
            mb="sm"
            color="emerald"
            value={dark ? "dark" : "light"}
            onChange={(v) => setColorScheme(v as "light" | "dark")}
            data={[
              { value: "light", label: <Center style={{ gap: 6 }}><Sun size={14} /> Light</Center> },
              { value: "dark", label: <Center style={{ gap: 6 }}><Moon size={14} /> Dark</Center> },
            ]}
          />
          <Group gap="sm" wrap="nowrap" p="xs" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--mantine-radius-md)" }}>
            <Avatar src={user?.avatarUrl || null} color="emerald" radius="md" size="md">
              {initials}
            </Avatar>
            <Box
              component={Link}
              to="/app/settings"
              style={{ flex: 1, overflow: "hidden", color: "inherit", textDecoration: "none" }}
            >
              <Text size="sm" fw={600} truncate>{user?.name}</Text>
              <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
            </Box>
            <ActionIcon
              variant="subtle" color="gray" title="Log out"
              onClick={() => confirmLogout(() => { logout(); notify.info("You have been logged out."); })}
            >
              <LogOut size={16} />
            </ActionIcon>
          </Group>
        </MantineShell.Section>
      </MantineShell.Navbar>

      <MantineShell.Main style={{ background: "var(--bg)", position: "relative" }}>
        <div className="glow glow-a" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Full access means an accidental delete lands on a real customer.
              The banner is deliberately loud and always in reach. */}
          {impersonating && (
            <Alert
              color="orange"
              variant="filled"
              radius="md"
              mb="lg"
              icon={<Eye size={18} />}
            >
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
  );
}
