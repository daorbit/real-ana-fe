import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Title, Text, TextInput, Stack, Group, Badge, Card, Center, Loader, ThemeIcon,
  Avatar, SegmentedControl, Pagination, Button, Table, Tooltip, ActionIcon,
  HoverCard, Image,
} from "@mantine/core";
import { Search, SearchX, X, LogIn, ShieldAlert, Trash2, Mail, CreditCard, RefreshCw } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmailComposer } from "@/features/admin/components/EmailComposer";
import { AdminPlanDialog } from "@/features/admin/components/AdminPlanDialog";
import { useGetAdminUsersQuery, useDeleteAdminUserMutation } from "@/app/store";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { num, timeAgo, shortDate } from "@/shared/lib";
import type { AdminUser } from "@/shared/types";

/**
 * Accounts per page. Mirrors `USERS_PAGE_SIZE` in the admin route — the server
 * decides the slice, this is only what the "showing 1–10 of 42" line counts
 * with. If the two drift, that line lies; the table itself stays correct.
 */
const USERS_PER_PAGE = 10;

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
  // The one account being messaged, when the mail button in a row is used.
  const [messaging, setMessaging] = useState<AdminUser | null>(null);
  // The one account whose plan dialog is open.
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);

  // Debounced, so typing a name doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // A narrower filter can leave you past the last page, showing nothing.
  useEffect(() => setPage(1), [search, role]);

  const isAdmin = useIsPlatformAdmin();

  const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery(
    { q: search || undefined, role: role || undefined, page },
    { skip: !isAdmin }
  );
  const [deleteUser] = useDeleteAdminUserMutation();
  const isSuperAdmin = user?.role === "super_admin" && !user?.impersonating;

  const enter = async (u: AdminUser) => {
    trace(user?.id, "impersonate_user", "impersonate", u.id);
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
        trace(user?.id, "delete_user_account", "impersonate", u.id);
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
        <Group gap="sm">
          {/* The total lives in the table footer now, next to the range it
              belongs with — two copies of the same number was one too many. */}
          <Tooltip label="Refetch">
            <ActionIcon variant="light" color="gray" size="lg" radius="md" loading={isFetching} onClick={refetch}>
              <RefreshCw size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Keyed by account so the draft never carries over between recipients. */}
      <EmailComposer
        key={messaging?.id}
        opened={Boolean(messaging)}
        user={messaging}
        onClose={() => setMessaging(null)}
      />

      <AdminPlanDialog user={planUser} onClose={() => setPlanUser(null)} />

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
            <Table.ScrollContainer minWidth={1000}>
              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Account</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Plan</Table.Th>
                    <Table.Th>Joined</Table.Th>
                    <Table.Th>Workspaces</Table.Th>
                    <Table.Th>Sites</Table.Th>
                    <Table.Th>Events</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((u) => {
                    const admin = u.role === "admin" || u.role === "super_admin";
                    const isSelf = u.id === user?.id;
                    const rowBusy = busy === u.id || deleting === u.id;
                    // The superadmin can open a regular admin's dashboard for
                    // oversight — everyone else is blocked from any admin row,
                    // and nobody (including the superadmin) opens another
                    // superadmin's, matching the server-side guard.
                    const impersonateBlocked =
                      u.role === "super_admin" || (u.role === "admin" && !isSuperAdmin);
                    return (
                      <Table.Tr key={u.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                            {u.avatarUrl ? (
                              // Only accounts with a real picture get the hover
                              // preview — a blown-up pair of initials is noise.
                              <HoverCard width={220} shadow="md" withArrow openDelay={200} position="right">
                                <HoverCard.Target>
                                  <UserAvatar
                                    src={u.avatarUrl}
                                    name={u.name}
                                    color="emerald"
                                    radius="xl"
                                    size="md"
                                    style={{ cursor: "zoom-in" }}
                                  />
                                </HoverCard.Target>
                                <HoverCard.Dropdown p="xs">
                                  <Image
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    radius="md"
                                    fit="contain"
                                    h={200}
                                    // Same reason as UserAvatar — Google's CDN
                                    // 403s a request carrying our referrer.
                                    referrerPolicy="no-referrer"
                                  />
                                </HoverCard.Dropdown>
                              </HoverCard>
                            ) : (
                              <Avatar color="emerald" radius="xl" size="md">
                                {u.name.slice(0, 2).toUpperCase()}
                              </Avatar>
                            )}
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
                          {u.plan ? (
                            <Badge
                              size="sm"
                              variant="light"
                              color={u.plan.expired ? "red" : u.plan.slug === "pro" ? "emerald" : "gray"}
                            >
                              {u.plan.name}{u.plan.expired ? " (expired)" : ""}
                            </Badge>
                          ) : (
                            <Text size="xs" c="dimmed">none</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{shortDate(u.createdAt)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{u.workspaceCount}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{u.siteCount}</Text>
                        </Table.Td>
                        <Table.Td>
                          {/* A zero here means the account has never been
                              tracked, which reads differently from "quiet
                              lately" — so only show a last-seen when there is
                              something to have been seen. */}
                          <Text size="sm">{num(u.eventCount)}</Text>
                          {u.eventCount > 0 && (
                            <Text size="xs" c="dimmed">{timeAgo(u.lastEventAt)}</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end" wrap="nowrap">
                            <Tooltip
                              label={
                                u.role === "super_admin"
                                  ? "The superadmin can't be opened"
                                  : impersonateBlocked
                                  ? "Admins can't be opened"
                                  : "Open dashboard as this user"
                              }
                              withArrow
                            >
                              <Button
                                size="xs"
                                variant="light"
                                color="emerald"
                                leftSection={
                                  busy === u.id ? <Loader size={12} color="emerald" /> : <LogIn size={14} />
                                }
                                disabled={impersonateBlocked || rowBusy}
                                onClick={() => enter(u)}
                              >
                                Open
                              </Button>
                            </Tooltip>
                            <Tooltip label="Plan details" withArrow>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                size="lg"
                                radius="md"
                                onClick={() => {
                                  trace(user?.id, "view_user_plan_clicked", "impersonate", "plan_dialog");
                                  setPlanUser(u);
                                }}
                              >
                                <CreditCard size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={`Email ${u.email}`} withArrow>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                size="lg"
                                radius="md"
                                disabled={rowBusy}
                                onClick={() => {
                                  trace(user?.id, "message_user_clicked", "impersonate", "email_composer");
                                  setMessaging(u);
                                }}
                              >
                                <Mail size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip
                              label={
                                !isSuperAdmin
                                  ? "Only the superadmin can delete accounts"
                                  : isSelf
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
                                disabled={!isSuperAdmin || admin || isSelf || rowBusy}
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

          {/* A footer bar rather than a lone centred pager: "which rows am I
              looking at, out of how many" is the question a paged table raises,
              and the controls mean little without it. Shown whenever there are
              results — the range is worth reading on a single page too. */}
          {data && data.total > 0 && (
            <Group justify="space-between" align="center" mt="md" wrap="wrap" gap="sm">
              <Text size="sm" c="dimmed">
                Showing{" "}
                <Text span fw={600} c="var(--text)">
                  {(page - 1) * USERS_PER_PAGE + 1}–
                  {Math.min(page * USERS_PER_PAGE, data.total)}
                </Text>{" "}
                of{" "}
                <Text span fw={600} c="var(--text)">
                  {data.total.toLocaleString()}
                </Text>{" "}
                {data.total === 1 ? "account" : "accounts"}
              </Text>

              {data.pages > 1 && (
                <Pagination
                  size="md"
                  radius="md"
                  color="emerald"
                  value={page}
                  onChange={setPage}
                  total={data.pages}
                  withEdges
                  // One neighbour each side keeps the control a fixed width as
                  // the page moves, instead of growing and shifting the row.
                  siblings={1}
                />
              )}
            </Group>
          )}
        </>
      )}
    </AppShell>
  );
}
