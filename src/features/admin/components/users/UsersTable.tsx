import { Card, Table, Text } from "@mantine/core";
import { num, shortDate, timeAgo } from "@/shared/lib";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import { UserAccountCell } from "./UserAccountCell";
import { UserPlanBadge, UserRoleBadge } from "./UserBadges";
import { UserRowActions } from "./UserRowActions";
import classes from "../Admin.module.css";

interface Props {
  users: AdminUser[];
  fetching: boolean;
  actions: AdminUserActions;
}

export function UsersTable({ users, fetching, actions }: Props) {
  return (
    <Card withBorder radius="md" p={0} className={classes.tableCard} data-fetching={fetching || undefined}>
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
              <Table.Th className={classes.actionsHead}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td><UserAccountCell user={u} /></Table.Td>
                <Table.Td><UserRoleBadge user={u} /></Table.Td>
                <Table.Td><UserPlanBadge user={u} /></Table.Td>
                <Table.Td><Text size="sm">{shortDate(u.createdAt)}</Text></Table.Td>
                <Table.Td><Text size="sm">{u.workspaceCount}</Text></Table.Td>
                <Table.Td><Text size="sm">{u.siteCount}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm">{num(u.eventCount)}</Text>
                  {u.eventCount > 0 && <Text size="xs" c="dimmed">{timeAgo(u.lastEventAt)}</Text>}
                </Table.Td>
                <Table.Td><UserRowActions user={u} actions={actions} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
