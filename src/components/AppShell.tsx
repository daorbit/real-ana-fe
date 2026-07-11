import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppShell as MantineShell, NavLink, Select, Avatar, Group, Text, ActionIcon, ScrollArea, Box,
} from "@mantine/core";
import { Home, BarChart3, FolderKanban, LogOut } from "lucide-react";
import { Wordmark } from "./Brand";
import { useAuth } from "../auth";
import { useWorkspace } from "../workspace";

const NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/workspaces", label: "Workspaces", icon: FolderKanban },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { workspaces, active, setActive } = useWorkspace();
  const loc = useLocation();
  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <MantineShell
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="lg"
    >
      <MantineShell.Navbar p="md">
        <MantineShell.Section>
          <Box component={Link} to="/app" px={6} pb="md" display="block">
            <Wordmark />
          </Box>
        </MantineShell.Section>

        {workspaces.length > 0 && (
          <MantineShell.Section mb="md">
            <Select
              label="Workspace"
              size="sm"
              data={workspaces.map((w) => ({ value: w._id, label: w.name }))}
              value={active?._id ?? null}
              onChange={(v) => v && setActive(v)}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </MantineShell.Section>
        )}

        <MantineShell.Section grow component={ScrollArea}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              component={Link}
              to={n.to}
              label={n.label}
              leftSection={<n.icon size={18} />}
              active={loc.pathname === n.to}
              variant="light"
              mb={4}
            />
          ))}
        </MantineShell.Section>

        <MantineShell.Section>
          <Group gap="sm" wrap="nowrap" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            <Avatar color="indigo" radius="xl" size="md">{initials}</Avatar>
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

      <MantineShell.Main bg="gray.0">{children}</MantineShell.Main>
    </MantineShell>
  );
}
