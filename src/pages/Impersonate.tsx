import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Title, Text, TextInput, Stack, Group, Badge, Card, Center, Loader, ThemeIcon,
  Avatar, SegmentedControl, Pagination, Button, Table, Tooltip, ActionIcon,
} from "@mantine/core";
import { Search, SearchX, X, LogIn, ShieldAlert, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useGetAdminUsersQuery, useDeleteAdminUserMutation } from "../store";
import { useAuth } from "../auth";
import { notify, errMessage, confirmDelete } from "../notify";
import type { AdminUser } from "../types";

const ROLE_FILTERS = [
  { label: "All", value: "" },
  { label: "Users", value: "user" },
  { label: "Admins", value: "admin" },
];

/**
 * Admin-only: browse every account, open the dashboard as one of them, or
 * delete one outright.
 *
 * Admins are listed but neither selectable nor deletable — impersonating one
 * would be a way to climb sideways into another admin's session, and deleting
 * one is an escalation/own-goal path with no legitimate use. Both guards are
 * enforced server-side too; the disabled controls here are just the friendly
 * half.
 */
export default function Impersonate() {
  const { user, impersonate } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Debounced, so typing a name doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // A narrower filter can leave you past the last page, showing nothing.
  useEffect(() => setPage(1), [search, role]);

  const isAdmin = user?.role === "admin" && !user?.impersonating;

  const { data, isLoading, isFetching } = useGetAdminUsersQuery(
    { q: search || undefined, role: role || undefined, page },
    { skip: !isAdmin }
  );
  const [deleteUser] = useDeleteAdminUserMutation();

  const enter = async (u: AdminUser) => {
    setBusy(u.id);
    try {
      await impersonate(u.id);
      navigate("/app");
      notify.success(`You are now viewing as ${u.email}.`, "Impersonating");
    } catch (e) {
      notify.error(errMessage(e, "Could not switch to that user."));
    } finally {
      setBusy(null);
    }
  };

  const remove = (u: AdminUser) => {
    confirmDelete({
      title: "Delete this account?",
      confirmLabel: "Delete account",
      body: (
        <>
          <b>{u.name}</b> ({u.email}) and everything they own — every workspace,
          site, API key, and all recorded analytics — will be permanently
          deleted. This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        setDeleting(u.id);
        try {
          await deleteUser(u.id).unwrap();
          notify.success(`${u.email} has been deleted.`, "Account deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete that account."));
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  // The route is admin-only server-side too; this is just a friendlier wall
  // than a page full of failed requests.
  if (!isAdmin) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="gray" size={56} radius="md">
              <ShieldAlert size={28} />
            </ThemeIcon>
            <Text fw={600}>Admins only</Text>
            <Text c="dimmed" size="sm">This page isn't available on your account.</Text>
            <Button variant="light" onClick={() => navigate("/app")}>Back to Home</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const users = data?.users ?? [];

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={1}>Users</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Every account on the platform. Open the dashboard as one, or delete one.
          </Text>
        </div>
        {data && (
          <Badge variant="light" color="emerald" size="lg">
            {data.total} account{data.total === 1 ? "" : "s"}
          </Badge>
        )}
      </Group>

      <Group mb="lg" align="flex-end" wrap="wrap">
        <TextInput
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<Search size={15} />}
          rightSection={
            query ? (
              <X size={15} style={{ cursor: "pointer" }} onClick={() => setQuery("")} />
            ) : null
          }
          style={{ flex: 1, minWidth: 260 }}
        />
        <SegmentedControl
          size="sm"
          radius="md"
          color="emerald"
          value={role}
          onChange={setRole}
          data={ROLE_FILTERS}
        />
      </Group>

      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !users.length ? (
        <Center py="xl">
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" color="gray" size="xl" radius="md">
              <SearchX size={20} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              {search ? `No users match “${search}”` : "No users here"}
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          {/* Dim the table, rather than swapping it for a spinner, so the rows
              don't jump while a page or filter loads. */}
          <Card withBorder radius="md" p={0} style={{ opacity: isFetching ? 0.6 : 1, overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Account</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Workspaces</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((u) => {
                    const admin = u.role === "admin";
                    const isSelf = u.id === user?.id;
                    const rowBusy = busy === u.id || deleting === u.id;
                    return (
                      <Table.Tr key={u.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                            <Avatar color="emerald" radius="xl" size="md">
                              {u.name.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <div style={{ minWidth: 0 }}>
                              <Text fw={600} size="sm" truncate>{u.name}</Text>
                              <Text size="xs" c="dimmed" truncate>{u.email}</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="sm"
                            variant="light"
                            color={admin ? "grape" : "gray"}
                          >
                            {u.role}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {u.workspaceCount} workspace{u.workspaceCount === 1 ? "" : "s"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end" wrap="nowrap">
                            <Tooltip
                              label={admin ? "Admins can't be opened" : "Open dashboard as this user"}
                              withArrow
                            >
                              <Button
                                size="xs"
                                variant="light"
                                color="emerald"
                                leftSection={
                                  busy === u.id ? <Loader size={12} color="emerald" /> : <LogIn size={14} />
                                }
                                disabled={admin || rowBusy}
                                onClick={() => enter(u)}
                              >
                                Open
                              </Button>
                            </Tooltip>
                            <Tooltip
                              label={
                                isSelf
                                  ? "You can't delete yourself"
                                  : admin
                                  ? "Admins can't be deleted"
                                  : "Delete this account"
                              }
                              withArrow
                            >
                              <ActionIcon
                                variant="light"
                                color="red"
                                size="lg"
                                radius="md"
                                disabled={admin || isSelf || rowBusy}
                                onClick={() => remove(u)}
                              >
                                {deleting === u.id ? <Loader size={14} color="red" /> : <Trash2 size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>

          {data && data.pages > 1 && (
            <Center mt="xl">
              <Pagination
                size="sm"
                radius="md"
                color="emerald"
                value={page}
                onChange={setPage}
                total={data.pages}
              />
            </Center>
          )}
        </>
      )}
    </AppShell>
  );
}
