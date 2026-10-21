import { Button, Loader, Tooltip } from "@mantine/core";
import { CreditCard, LogIn, Mail, RotateCw, UserCog } from "lucide-react";
import { shortDate } from "@/shared/lib";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import { AdminUserAvatar } from "../users/AdminUserAvatar";
import { UserPlanBadge, UserRoleBadge } from "../users/UserBadges";
import { UserRoleMenu } from "../users/UserRoleMenu";
import { UserReferralSources } from "./UserReferralSources";
import classes from "./userDetail.module.css";

interface Props {
  user: AdminUser;
  actions: AdminUserActions;
  refreshing: boolean;
  onRefresh: () => void;
}

export function UserDetailHeader({ user, actions, refreshing, onRefresh }: Props) {
  const { impersonateBlocked, rowBusy, isSelf } = actions.rowState(user);

  return (
    <div className={`${classes.card} ${classes.header}`}>
      <div className={classes.identity}>
        <AdminUserAvatar user={user} size={56} />
        <div className={classes.identityText}>
          <span className={classes.name}>{user.name || user.email}</span>
          <span className={classes.email}>{user.email}</span>
          <div className={classes.badges}>
            <UserRoleBadge user={user} />
            <UserPlanBadge user={user} />
            <span>Joined {shortDate(user.createdAt)}</span>
          </div>
          <UserReferralSources sources={user.referralSources} />
        </div>
      </div>

      <div className={classes.actions}>
        <Tooltip
          label={user.role === "super_admin" ? "Super admins can't be opened" : "Admins can't be opened"}
          disabled={!impersonateBlocked}
          withArrow
        >
          <Button
            size="sm"
            radius="md"
            color="emerald"
            leftSection={actions.busy === user.id ? <Loader size={12} color="white" /> : <LogIn size={15} />}
            disabled={impersonateBlocked || rowBusy}
            onClick={() => actions.enter(user)}
          >
            Open dashboard
          </Button>
        </Tooltip>
        <Button size="sm" radius="md" variant="default" leftSection={<CreditCard size={15} />} onClick={() => actions.openPlan(user)}>
          Plan
        </Button>
        <Button size="sm" radius="md" variant="default" leftSection={<Mail size={15} />} onClick={() => actions.openMessage(user)}>
          Email
        </Button>
        {actions.isSuperAdmin && !isSelf && (
          <UserRoleMenu user={user} actions={actions}>
            <Button size="sm" radius="md" variant="default" leftSection={<UserCog size={15} />} loading={actions.changingRole}>
              Role
            </Button>
          </UserRoleMenu>
        )}
        <Button size="sm" radius="md" variant="default" leftSection={<RotateCw size={15} />} loading={refreshing} onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
