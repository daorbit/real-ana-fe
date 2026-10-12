import { Avatar, HoverCard, Image, Text } from "@mantine/core";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { AdminUser } from "@/shared/types";
import classes from "../Admin.module.css";

export function UserAccountCell({ user }: { user: AdminUser }) {
  return (
    <div className={classes.account}>
      {user.avatarUrl ? (
        <HoverCard width={220} shadow="md" withArrow openDelay={200} position="right">
          <HoverCard.Target>
            <UserAvatar
              src={user.avatarUrl}
              name={user.name}
              color="emerald"
              radius="xl"
              size="md"
              className={classes.zoomAvatar}
            />
          </HoverCard.Target>
          <HoverCard.Dropdown p="xs">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              radius="md"
              fit="contain"
              h={200}
              referrerPolicy="no-referrer"
            />
          </HoverCard.Dropdown>
        </HoverCard>
      ) : (
        <Avatar color="emerald" radius="xl" size="md">
          {user.name.slice(0, 2).toUpperCase()}
        </Avatar>
      )}
      <div className={classes.accountText}>
        <Text fw={600} size="sm" truncate>{user.name}</Text>
        <Text size="xs" c="dimmed" truncate>{user.email}</Text>
      </div>
    </div>
  );
}
