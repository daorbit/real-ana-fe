import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Text, Group, Card, TextInput, Center, Badge, ThemeIcon, Table,
  UnstyledButton,
} from "@mantine/core";
import { Search, Users, ArrowRight } from "lucide-react";
import { useGetJourneyUsersQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { timeAgo } from "@/shared/lib";

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

  const { data, isFetching } = useGetJourneyUsersQuery(
    { wid: active?._id ?? "", q: q || undefined },
    { skip: !active },
  );
  const users = data?.users ?? [];

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

      {!isFetching && users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No traced users yet"
          description="Once your app calls the Platform API's track endpoint with a real user id, they'll show up here — see Help → Documentation for the identify + track example."
        />
      ) : (
        <Card withBorder radius="lg" padding={0}>
          <Table verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Last action</Table.Th>
                <Table.Th>Events</Table.Th>
                <Table.Th>Last seen</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr
                  key={u.appUserId}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/journey/${encodeURIComponent(u.appUserId)}`)}
                >
                  <Table.Td>
                    <UnstyledButton>
                      <Text fw={600} size="sm">{u.appUserId}</Text>
                    </UnstyledButton>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" radius="sm">{u.lastAction}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{u.eventCount}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{timeAgo(u.lastSeen)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end">
                      <ThemeIcon variant="subtle" color="gray" size="sm">
                        <ArrowRight size={14} />
                      </ThemeIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {isFetching && users.length === 0 && (
        <Center mih="30vh">
          <Text size="sm" c="dimmed">Loading…</Text>
        </Center>
      )}
    </AppShell>
  );
}
