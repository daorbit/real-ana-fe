import { LogOut, UserMinus } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { shortDate } from "@/shared/lib";
import type { WorkspaceMember, WorkspaceRole } from "@/shared/types";
import { RoleSelect } from "./RoleSelect";
import { RowMenu } from "./RowMenu";
import { roleLabel } from "./roles";
import classes from "./Members.module.css";

export function MemberRow({
  member,
  manageable,
  grantable,
  onRoleChange,
  onRemove,
}: {
  member: WorkspaceMember;
  manageable: boolean;
  grantable: WorkspaceRole[];
  onRoleChange: (role: WorkspaceRole) => void;
  onRemove: () => void;
}) {
  const name = member.name || member.email;
  const removable = member.isSelf ? member.role !== "owner" : manageable;

  return (
    <div className={`${classes.grid} ${classes.row}`}>
      <div className={classes.member}>
        <UserAvatar src={member.avatarUrl} name={name} radius="xl" size={34} />
        <div className={classes.memberText}>
          <div className={classes.name}>
            {name}
            {member.isSelf && <span className={classes.you}>(you)</span>}
          </div>
          <div className={classes.email}>{member.email}</div>
        </div>
      </div>

      <div>
        {manageable ? (
          <RoleSelect value={member.role} options={grantable} label={`Role for ${name}`} onChange={onRoleChange} />
        ) : (
          <span className={classes.roleText}>{roleLabel(member.role)}</span>
        )}
      </div>

      <span className={`${classes.date} ${classes.colJoined}`}>{shortDate(member.joinedAt)}</span>

      <div>
        {removable && (
          <RowMenu
            label={`Actions for ${name}`}
            actionLabel={member.isSelf ? "Leave workspace" : "Remove from workspace"}
            icon={member.isSelf ? <LogOut size={14} /> : <UserMinus size={14} />}
            onAction={onRemove}
          />
        )}
      </div>
    </div>
  );
}
