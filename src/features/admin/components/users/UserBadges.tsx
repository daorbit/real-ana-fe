import { Badge, Text } from "@mantine/core";
import type { AdminUser } from "@/shared/types";

export function UserRoleBadge({ user }: { user: AdminUser }) {
  const admin = user.role === "admin" || user.role === "super_admin";
  return (
    <Badge size="sm" variant="light" color={admin ? "grape" : "gray"}>
      {user.role}
    </Badge>
  );
}

export function UserPlanBadge({ user }: { user: AdminUser }) {
  if (!user.plan) return <Text size="xs" c="dimmed">none</Text>;
  return (
    <Badge
      size="sm"
      variant="light"
      color={user.plan.expired ? "red" : user.plan.slug === "pro" ? "emerald" : "gray"}
    >
      {user.plan.name}{user.plan.expired ? " (expired)" : ""}
    </Badge>
  );
}
