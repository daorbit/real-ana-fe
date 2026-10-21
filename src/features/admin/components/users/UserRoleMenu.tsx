import type { ReactNode } from "react";
import { Menu, Text } from "@mantine/core";
import { Check } from "lucide-react";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import { ROLE_LABELS, ROLE_OPTIONS } from "../../lib/userRoles";
import classes from "../Admin.module.css";

interface Props {
  user: AdminUser;
  actions: AdminUserActions;
  children: ReactNode;
}

export function UserRoleMenu({ user, actions, children }: Props) {
  return (
    <Menu position="bottom-end" width={260} withinPortal>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Role</Menu.Label>
        {ROLE_OPTIONS.map(({ role, hint }) => {
          const current = role === user.role;
          return (
            <Menu.Item
              key={role}
              className={current ? classes.roleItemActive : undefined}
              rightSection={current ? <Check size={14} className={classes.roleCheck} /> : null}
              onClick={() => actions.changeRole(user, role)}
            >
              <Text size="sm">{ROLE_LABELS[role]}</Text>
              <Text size="xs" c="dimmed">{hint}</Text>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
