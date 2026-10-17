import { useEffect, useState } from "react";
import { Text, TextInput, Stack, Center, Loader, ThemeIcon, SegmentedControl, Pagination, CloseButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Search, SearchX } from "lucide-react";
import { EmailComposer } from "@/features/admin/components/EmailComposer";
import { AdminPlanDialog } from "@/features/admin/components/AdminPlanDialog";
import { UsersTable } from "@/features/admin/components/users/UsersTable";
import { UserMobileList } from "@/features/admin/components/users/UserMobileList";
import { FilterChips } from "@/shared/ui/FilterChips";
import { useAdminUserActions } from "@/features/admin/useAdminUserActions";
import { useGetAdminUsersQuery } from "@/app/store";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";
import classes from "@/features/admin/components/Admin.module.css";

const USERS_PER_PAGE = 10;

const ROLE_FILTERS = [
  { label: "All", value: "" },
  { label: "Users", value: "user" },
  { label: "Admins", value: "admin" },
];

export default function UsersPanel() {
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const actions = useAdminUserActions();

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => setPage(1), [search, role]);

  const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery({
    q: search || undefined,
    role: role || undefined,
    page,
  });

  const users = data?.users ?? [];

  return (
    <AdminSection id="users" actions={<AdminRefreshButton onClick={refetch} loading={isFetching} />}>
      <EmailComposer
        key={actions.messaging?.id}
        opened={Boolean(actions.messaging)}
        user={actions.messaging}
        onClose={actions.closeMessage}
      />

      <AdminPlanDialog user={actions.planUser} onClose={actions.closePlan} />

      <div className={classes.toolbar}>
        <TextInput
          className={mobile ? classes.mobileSearch : classes.search}
          placeholder={mobile ? "Search" : "Search by name or email…"}
          aria-label="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<Search size={mobile ? 16 : 15} />}
          rightSection={query ? <CloseButton size="sm" onClick={() => setQuery("")} aria-label="Clear search" /> : null}
        />
        {mobile ? (
          <div className={classes.chipsRow}>
            <FilterChips value={role} onChange={setRole} data={ROLE_FILTERS} ariaLabel="Filter by role" />
          </div>
        ) : (
          <SegmentedControl size="sm" radius="md" value={role} onChange={setRole} data={ROLE_FILTERS} />
        )}
      </div>

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
          {mobile ? (
            <UserMobileList users={users} fetching={isFetching} actions={actions} />
          ) : (
            <UsersTable users={users} fetching={isFetching} actions={actions} />
          )}

          {data && data.total > 0 && (
            <div className={classes.pager}>
              <Text size="sm" c="dimmed">
                Showing{" "}
                <Text span fw={600} c="var(--text)">
                  {(page - 1) * USERS_PER_PAGE + 1}–{Math.min(page * USERS_PER_PAGE, data.total)}
                </Text>{" "}
                of{" "}
                <Text span fw={600} c="var(--text)">
                  {data.total.toLocaleString()}
                </Text>{" "}
                {data.total === 1 ? "account" : "accounts"}
              </Text>

              {data.pages > 1 && (
                <Pagination
                  size={mobile ? "sm" : "md"}
                  radius="md"
                  value={page}
                  onChange={setPage}
                  total={data.pages}
                  withEdges={!mobile}
                  siblings={mobile ? 0 : 1}
                />
              )}
            </div>
          )}
        </>
      )}
    </AdminSection>
  );
}
