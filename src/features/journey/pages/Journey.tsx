import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Text, Group, Card, TextInput, Center, Badge, ThemeIcon, Stack, Pagination,
  Skeleton, Box,
} from "@mantine/core";
import { Search, Users, ArrowRight, Fingerprint } from "lucide-react";
import { useGetJourneyUsersQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { timeAgo } from "@/shared/lib";

const PAGE_SIZE = 10;

/**
 * Identified users traced from a real web or mobile app via the workspace's
 * Platform API key — not the anonymous landing-page tracker. Each row is an
 * entry point into that user's journey: click through to see every
 * src -> action -> dest step, in order.
 */
export default function Journey() {
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // A new search narrows the result set, so paging resets to the top rather
  // than landing on a page that may no longer exist.
  useEffect(() => setPage(1), [q]);

  const { data, isFetching } = useGetJourneyUsersQuery(
    { wid: active?._id ?? "", q: q || undefined, page },
    { skip: !active },
  );
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / (data?.pageSize ?? PAGE_SIZE)));

  return (
    <AppShell>
      <PageHeader
        title="User journeys"
        description="Every action a signed-up user took in your app, from where to where — traced via the Platform API, not the anonymous site tracker."
        actions={<PageHelpButton />}
      />

      <TextInput
        placeholder="Search by user id"
        leftSection={<Search size={15} />}
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        mb="lg"
        maw={360}
      />

      {isFetching && users.length === 0 ? (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} withBorder radius="md" padding="md">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <Skeleton height={38} width={38} radius="md" />
                  <Stack gap={6} style={{ flex: 1, maxWidth: 320 }}>
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={10} width="35%" />
                  </Stack>
                </Group>
                <Skeleton height={22} width={90} radius="sm" />
              </Group>
            </Card>
          ))}
        </Stack>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "No users match your search" : "No traced users yet"}
          description={
            q
              ? "Try a different user id."
              : "Once your app calls the Platform API's track endpoint with a real user id, they'll show up here — see Help → Documentation for the trace() example."
          }
        />
      ) : (
        <Stack gap="xs">
          {users.map((u) => (
            <Card
              key={u.appUserId}
              withBorder
              radius="md"
              padding="md"
              className="journey-row"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/app/journey/${encodeURIComponent(u.appUserId)}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <ThemeIcon variant="light" color="gray" radius="md" size={38}>
                    <Fingerprint size={19} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm" truncate>{u.appUserId}</Text>
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm" c="dimmed">{u.eventCount} events</Text>
                      <Text size="sm" c="dimmed">&bull;</Text>
                      <Text size="sm" c="dimmed">{timeAgo(u.lastSeen)}</Text>
                    </Group>
                  </Box>
                </Group>

                <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Badge variant="light" color="gray" radius="sm">{u.lastAction}</Badge>
                  <ThemeIcon variant="subtle" color="gray" size="sm">
                    <ArrowRight size={14} />
                  </ThemeIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {total > PAGE_SIZE && (
        <Group justify="flex-end" mt="lg">
          <Pagination
            total={pageCount}
            value={page}
            onChange={setPage}
            color="emerald"
          />
        </Group>
      )}

      {isFetching && users.length > 0 && (
        <Center mt="md">
          <Text size="xs" c="dimmed">Loading…</Text>
        </Center>
      )}
    </AppShell>
  );
}
