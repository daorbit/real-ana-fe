import { Menu, UnstyledButton } from "@mantine/core";
import { Check, UserMinus } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import classes from "./Tasks.module.css";

export function AssigneePicker({
  value,
  members,
  memberMap,
  readOnly,
  onChange,
}: {
  value: string | null;
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  readOnly: boolean;
  onChange: (userId: string | null) => void;
}) {
  const current = value ? memberMap.get(value) : undefined;
  const chip = (
    <UnstyledButton className={classes.assignee} disabled={readOnly}>
      {current ? (
        <>
          <UserAvatar src={current.avatarUrl} name={current.name || current.email} size={26} radius="xl" />
          <span className={classes.assigneeName}>{current.name || current.email}</span>
        </>
      ) : (
        <span className={classes.assigneeEmpty}>Assign</span>
      )}
    </UnstyledButton>
  );

  if (readOnly) return chip;

  return (
    <Menu position="bottom-start" width={260}>
      <Menu.Target>{chip}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Assign to</Menu.Label>
        {members.map((m) => (
          <Menu.Item
            key={m.userId}
            leftSection={<UserAvatar src={m.avatarUrl} name={m.name || m.email} size={22} radius="xl" />}
            rightSection={m.userId === value ? <Check size={14} /> : null}
            onClick={() => onChange(m.userId)}
          >
            {m.name || m.email}
          </Menu.Item>
        ))}
        {value && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<UserMinus size={14} />} onClick={() => onChange(null)}>
              Unassign
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
