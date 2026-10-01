import { Avatar } from "@mantine/core";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceInvite, WorkspaceMember, WorkspaceRole } from "@/shared/types";
import { ROLE_META, ROLE_ORDER, roleLabel } from "./roles";
import classes from "./Members.module.css";

const STACK_LIMIT = 4;

export function MembersOverview({
  workspaceName,
  members,
  invites,
  myRole,
}: {
  workspaceName: string;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  myRole: WorkspaceRole;
}) {
  const shown = members.slice(0, STACK_LIMIT);
  const extra = members.length - shown.length;
  const counts = ROLE_ORDER.map((role) => ({ role, count: members.filter((m) => m.role === role).length }))
    .filter((r) => r.count > 0);
  const MyIcon = ROLE_META[myRole].icon;

  return (
    <section className={classes.overview}>
      <div className={classes.headcount}>
        <Avatar.Group spacing={10} className={classes.avatarGroup}>
          {shown.map((m) => (
            <UserAvatar
              key={m.id}
              src={m.avatarUrl}
              name={m.name || m.email}
              radius="xl"
              size={42}
              className={classes.stackAvatar}
            />
          ))}
          {extra > 0 && (
            <Avatar radius="xl" size={42} className={classes.stackAvatar}>
              +{extra}
            </Avatar>
          )}
        </Avatar.Group>
        <div>
          <div className={classes.count}>
            <span className={classes.countValue}>{members.length}</span>
            <span className={classes.countLabel}>
              {members.length === 1 ? "person has access" : "people have access"}
            </span>
          </div>
          <p className={classes.countMeta}>
            {workspaceName}
            {invites.length > 0 && ` · ${invites.length} pending invitation${invites.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className={classes.breakdown}>
        {counts.map(({ role, count }) => (
          <span key={role} className={`${classes.tone} ${classes.breakdownItem}`} data-role={role}>
            <span className={classes.breakdownDot} />
            {roleLabel(role)}
            <span className={classes.breakdownCount}>{count}</span>
          </span>
        ))}
      </div>

      <div className={`${classes.tone} ${classes.access}`} data-role={myRole}>
        <span className={classes.accessIcon}>
          <MyIcon size={18} />
        </span>
        <div>
          <span className={classes.eyebrow}>Your access</span>
          <p className={classes.accessRole}>{roleLabel(myRole)}</p>
          <p className={classes.accessText}>{ROLE_META[myRole].short}</p>
        </div>
      </div>
    </section>
  );
}
