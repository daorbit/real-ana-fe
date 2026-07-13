import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Title, Text, TextInput, Stack, Group, Badge, Card, Center, Loader, ThemeIcon,
  Avatar, SegmentedControl, Pagination, SimpleGrid, Button, Alert,
} from "@mantine/core";
import { Search, SearchX, X, LogIn, ShieldAlert } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useGetAdminUsersQuery } from "../store";
import { useAuth } from "../auth";
import { notify, errMessage } from "../notify";
import type { AdminUser } from "../types";

const ROLE_FILTERS = [
  { label: "All", value: "" },
  { label: "Users", value: "user" },
  { label: "Admins", value: "admin" },
];

/**
 * Admin-only: browse every account and open the dashboard as one of them.
 *
 * Admins are listed but not selectable — impersonating one would be a way to
 * climb sideways into another admin's session, and there is no reason to.
 */
export default function Impersonate() {
  const { user, impersonate } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);

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
          <Title order={1}>View as user</Title>
          <Text c="dimmed" size="sm" mt={6}>
            Open the dashboard as another account.
          </Text>
        </div>
        {data && (
          <Badge variant="light" color="emerald" size="lg">
            {data.total} account{data.total === 1 ? "" : "s"}
          </Badge>
        )}
      </Group>

      <Alert color="orange" variant="light" icon={<ShieldAlert size={16} />} mb="lg">
        <Text size="sm">
          You get <b>full access</b> to the account you pick — anything you change or
          delete is changed for them, for real.
        </Text>
      </Alert>

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
          {/* Dim the list, rather than swapping it for a spinner, so the rows
              don't jump while a page or filter loads. */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm" style={{ opacity: isFetching ? 0.6 : 1 }}>
            {users.map((u) => {
              const admin = u.role === "admin";
              return (
                <Card
                  key={u.id}
                  withBorder
                  radius="md"
                  padding="md"
                  style={{
                    cursor: admin ? "not-allowed" : "pointer",
                    opacity: admin ? 0.55 : 1,
                  }}
                  onClick={() => !admin && !busy && enter(u)}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Avatar color="emerald" radius="xl" size="md">
                        {u.name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <div style={{ minWidth: 0 }}>
                        <Group gap={6} wrap="nowrap">
                          <Text fw={600} size="sm" truncate>{u.name}</Text>
                          {admin && <Badge size="xs" variant="light" color="gray">admin</Badge>}
                        </Group>
                        <Text size="xs" c="dimmed" truncate>{u.email}</Text>
                        <Text size="xs" c="dimmed">
                          {u.workspaceCount} workspace{u.workspaceCount === 1 ? "" : "s"}
                        </Text>
                      </div>
                    </Group>

                    {busy === u.id ? (
                      <Loader size="xs" />
                    ) : !admin ? (
                      <ThemeIcon variant="light" color="emerald" size="md" radius="md">
                        <LogIn size={15} />
                      </ThemeIcon>
                    ) : null}
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>

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
