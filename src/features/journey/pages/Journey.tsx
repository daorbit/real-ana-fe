import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Text, Group, TextInput, Badge, Stack, Pagination,
  Skeleton, Box, ActionIcon, Tooltip, Table, SegmentedControl, Select, CopyButton,
} from "@mantine/core";
import { Search, Users, ArrowRight, RotateCw, Copy, Check } from "lucide-react";
import { useGetJourneyUsersQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { timeAgo } from "@/shared/lib";
import { useTitle } from "@/shared/lib/useTitle";
import classes from "./Journey.module.css";

const PAGE_SIZE = 10;

type SortKey = "recent" | "events" | "new";

/**
 * A user id is a database key, not a name — an opaque hex string that is
 * unreadable at full length and unrecognisable at a glance. Showing the head
 * and tail keeps it identifiable (that is how anyone reads one: first few, last
 * few) while letting the column stay narrow enough for the signals beside it.
 */
function shortId(id: string): string {
  return id.length <= 18 ? id : `${id.slice(0, 8)}…${id.slice(-6)}`;
}

/**
 * Identified users traced from a real web or mobile app via the workspace's
 * Platform API key — not the anonymous landing-page tracker.
 *
 * Built as a lookup tool rather than a dashboard: the job it serves is "someone
 * wrote in, show me what they did", so search is first, the rows are dense and
 * comparable, and every row is a way into that user's timeline.
 */
export default function Journey() {
  useTitle("User journeys");
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("recent");
  const [filter, setFilter] = useState<"all" | "active">("all");

  // A new search or a different ordering narrows or reorders the result set,
  // so paging resets to the top rather than landing on a page that may no
  // longer exist.
  useEffect(() => setPage(1), [q, sort, filter]);

  const { data, isFetching, refetch } = useGetJourneyUsersQuery(
    { wid: active?._id ?? "", q: q || undefined, page, sort, filter },
    { skip: !active },
  );
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary;
  const pageCount = Math.max(1, Math.ceil(total / (data?.pageSize ?? PAGE_SIZE)));

  return (
    <AppShell>
      <PageHeader
        title="User journeys"
        description="Look up a signed-in user and replay what they did, step by step — traced via the Platform API, not the anonymous site tracker."
        actions={
          <Group gap="sm" wrap="nowrap">
            <Tooltip label="Refresh" withArrow>
              <ActionIcon
                variant="default"
                radius="md"
                size="lg"
                onClick={() => refetch()}
                aria-label="Refresh"
              >
                <RotateCw size={16} className={isFetching ? "spin" : undefined} />
              </ActionIcon>
            </Tooltip>
            <PageHelpButton />
          </Group>
        }
      />

      {/* Three numbers, not a chart: they answer "is anything arriving, and is
          it arriving now" — the two questions worth asking before searching. */}
      <Group gap="xl" mb="md" wrap="wrap">
        {[
          { label: "Traced users", value: summary?.users },
          { label: "Active today", value: summary?.activeToday },
          { label: "Events", value: summary?.events },
        ].map((stat) => (
          <Box key={stat.label}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1.6}>
              {stat.label}
            </Text>
            {summary ? (
              <Text fw={700} fz={22} lh={1.2}>
                {stat.value?.toLocaleString() ?? "—"}
              </Text>
            ) : (
              <Skeleton height={22} width={56} mt={4} radius="sm" />
            )}
          </Box>
        ))}
      </Group>

      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Search by user id"
          leftSection={<Search size={15} />}
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          maw={360}
          style={{ flex: 1, minWidth: 220 }}
        />
        <Group gap="sm" wrap="nowrap">
          <SegmentedControl
            size="sm"
            value={filter}
            onChange={(v) => setFilter(v as "all" | "active")}
            data={[
              { value: "all", label: "All" },
              { value: "active", label: "Active today" },
            ]}
          />
          <Select
            size="sm"
            w={170}
            value={sort}
            onChange={(v) => setSort((v as SortKey) ?? "recent")}
            allowDeselect={false}
            data={[
              { value: "recent", label: "Last seen" },
              { value: "events", label: "Most events" },
              { value: "new", label: "Newest user" },
            ]}
          />
        </Group>
      </Group>

      {isFetching ? (
        <Stack gap="xs">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={44} radius="sm" />
          ))}
        </Stack>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            q
              ? "No users match your search"
              : filter === "active"
                ? "Nobody active in the last 24 hours"
                : "No traced users yet"
          }
          description={
            q
              ? "Search matches the user id your app sends — try a fragment of it."
              : filter === "active"
                ? "Switch to All to see everyone traced so far."
                : "Once your app calls the Platform API's track endpoint with a real user id, they'll show up here — see Help → Documentation for the trace() example."
          }
        />
      ) : (
        <Table.ScrollContainer minWidth={720}>
          <Table withTableBorder verticalSpacing="sm" horizontalSpacing="md" className={classes.table}>
              <Table.Thead className={classes.thead}>
                <Table.Tr>
                  <Table.Th className={classes.th}>User</Table.Th>
                  <Table.Th className={classes.th}>Last action</Table.Th>
                  <Table.Th className={classes.th} w={130}>Last seen</Table.Th>
                  <Table.Th className={classes.th} w={110} ta="right">Sessions</Table.Th>
                  <Table.Th className={classes.th} w={110} ta="right">Events</Table.Th>
                  <Table.Th className={classes.th} w={52} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((u) => (
                  <Table.Tr
                    key={u.appUserId}
                    className={classes.row}
                    onClick={() => navigate(`/app/journey/${encodeURIComponent(u.appUserId)}`)}
                  >
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Text ff="monospace" size="sm" title={u.appUserId}>
                          {shortId(u.appUserId)}
                        </Text>
                        {/* Copying the id is what someone does next when they
                            are cross-referencing it against their own database,
                            and the shortened form cannot be selected by hand. */}
                        <CopyButton value={u.appUserId}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied" : "Copy full id"} withArrow>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                aria-label="Copy user id"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copy();
                                }}
                              >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="gray" radius="sm" tt="none">
                        {u.lastAction}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" title={new Date(u.lastSeen).toLocaleString()}>
                        {timeAgo(u.lastSeen)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" c="dimmed">{u.sessionCount || "—"}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{u.eventCount.toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <ArrowRight size={14} opacity={0.5} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      {total > PAGE_SIZE && (
        <Group justify="space-between" mt="lg" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            {total.toLocaleString()} users
          </Text>
          <Pagination
            total={pageCount}
            value={page}
            onChange={setPage}
            color="emerald"
          />
        </Group>
      )}
    </AppShell>
  );
}
