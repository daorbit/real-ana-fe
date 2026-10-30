import { Menu, Tooltip, UnstyledButton } from "@mantine/core";
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
  value: string[];
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  readOnly: boolean;
  onChange: (userIds: string[]) => void;
}) {
  const assigned = value.map((id) => memberMap.get(id)).filter((member): member is WorkspaceMember => Boolean(member));
  const chip = (
    <UnstyledButton className={classes.assignee} data-empty={!value.length || undefined} disabled={readOnly}>
      {assigned.length ? (
        <>
          <span className={classes.assigneeAvatars}>
            {assigned.slice(0, 3).map((member) => (
              <Tooltip key={member.userId} label={member.name || member.email} withArrow>
                <span>
                  <UserAvatar
                    src={member.avatarUrl}
                    name={member.name || member.email}
                    size={26}
                    radius="xl"
                  />
                </span>
              </Tooltip>
            ))}
          </span>
          <span className={classes.assigneeName}>
            {assigned.length === 1 && value.length === 1
              ? assigned[0].name || assigned[0].email
              : value.length > assigned.length
                ? `${value.length} assignees`
                : assigned.length <= 2
                  ? assigned.map((member) => member.name || member.email).join(", ")
                : `${value.length} people`}
          </span>
        </>
      ) : (
        <span className={classes.assigneeEmpty}>{value.length ? "Former member assigned" : "Assign"}</span>
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
            closeMenuOnClick={false}
            leftSection={<UserAvatar src={m.avatarUrl} name={m.name || m.email} size={22} radius="xl" />}
            rightSection={value.includes(m.userId) ? <Check size={14} /> : null}
            onClick={() =>
              onChange(
                value.includes(m.userId)
                  ? value.filter((id) => id !== m.userId)
                  : [...value, m.userId],
              )
            }
          >
            {m.name || m.email}
          </Menu.Item>
        ))}
        {value.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<UserMinus size={14} />} onClick={() => onChange([])}>
              Unassign everyone
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
