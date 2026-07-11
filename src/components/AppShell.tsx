import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, NavLink, Select, Avatar, Group, Text, ActionIcon, ScrollArea, Box,
  useMantineColorScheme, SegmentedControl, Center, useComputedColorScheme,
} from "@mantine/core";
import { Home, BarChart3, FolderKanban, LogOut, Moon, Sun, Code2 } from "lucide-react";
import { Wordmark } from "./Brand";
import { useAuth } from "../auth";
import { useWorkspace } from "../workspace";

const NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/workspaces", label: "Workspaces", icon: FolderKanban },
  { to: "/app/developers", label: "Developers", icon: Code2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { workspaces, active, setActive } = useWorkspace();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const loc = useLocation();
  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();
  const dark = scheme === "dark";

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
          {NAV.map((n) => {
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
            color="violet"
            value={dark ? "dark" : "light"}
            onChange={(v) => setColorScheme(v as "light" | "dark")}
            data={[
              { value: "light", label: <Center style={{ gap: 6 }}><Sun size={14} /> Light</Center> },
              { value: "dark", label: <Center style={{ gap: 6 }}><Moon size={14} /> Dark</Center> },
            ]}
          />
          <Group gap="sm" wrap="nowrap" p="xs" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--mantine-radius-md)" }}>
            <Avatar variant="gradient" gradient={{ from: "violet.4", to: "violet.6", deg: 135 }} radius="md" size="md">{initials}</Avatar>
            <Box style={{ flex: 1, overflow: "hidden" }}>
              <Text size="sm" fw={600} truncate>{user?.name}</Text>
              <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
            </Box>
            <ActionIcon variant="subtle" color="gray" onClick={logout} title="Log out">
              <LogOut size={16} />
            </ActionIcon>
          </Group>
        </MantineShell.Section>
      </MantineShell.Navbar>

      <MantineShell.Main style={{ background: "var(--bg)", position: "relative" }}>
        <div className="glow glow-a" />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </MantineShell.Main>
    </MantineShell>
  );
}
