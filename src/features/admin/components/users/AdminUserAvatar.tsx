import { Avatar } from "@mantine/core";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { AdminUser } from "@/shared/types";

export function AdminUserAvatar({ user, size = 38 }: { user: AdminUser; size?: number }) {
  if (user.avatarUrl) {
    return <UserAvatar src={user.avatarUrl} name={user.name} color="emerald" radius="xl" size={size} />;
  }
  return (
    <Avatar color="emerald" radius="xl" size={size}>
      {user.name.slice(0, 2).toUpperCase()}
    </Avatar>
  );
}
