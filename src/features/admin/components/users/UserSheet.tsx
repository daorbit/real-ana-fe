import { useEffect, useState } from "react";
import { CreditCard, LockKeyholeOpen, LogIn, Mail, ShieldOff, Trash2 } from "lucide-react";
import { num, shortDate, timeAgo } from "@/shared/lib";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { InsetList, InsetRow, RowIcon } from "@/shared/ui/InsetList";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import { AdminUserAvatar } from "./AdminUserAvatar";
import { UserPlanBadge, UserRoleBadge } from "./UserBadges";
import classes from "../Admin.module.css";

interface Props {
  user: AdminUser | null;
  actions: AdminUserActions;
  onClose: () => void;
}

export function UserSheet({ user, actions, onClose }: Props) {
  const [shown, setShown] = useState(user);

  useEffect(() => {
    if (user) setShown(user);
  }, [user]);

  const run = (fn: (u: AdminUser) => void) => {
    if (!shown) return;
    onClose();
    fn(shown);
  };

  const u = shown;
  const state = u ? actions.rowState(u) : null;
  const { isSuperAdmin, resetting2fa, resettingLock } = actions;

  return (
    <PanelDrawer
      opened={Boolean(user)}
      onClose={onClose}
      ariaLabel="Account details"
      header={
        u && (
          <div className={classes.profile}>
            <AdminUserAvatar user={u} size={48} />
            <div className={classes.profileText}>
              <span className={classes.sheetTitle}>{u.name}</span>
              <span className={classes.sheetMeta}>{u.email}</span>
            </div>
          </div>
        )
      }
    >
      {u && state && (
        <>
          <StatTileGrid>
            <StatTile label="Workspaces" value={String(u.workspaceCount)} />
            <StatTile label="Sites" value={String(u.siteCount)} />
            <StatTile label="Events" value={num(u.eventCount)} />
          </StatTileGrid>

          <InsetList header="Account">
            <InsetRow title="Role" trailing={<UserRoleBadge user={u} />} />
            <InsetRow title="Plan" trailing={<UserPlanBadge user={u} />} />
            <InsetRow title="Joined" trailing={shortDate(u.createdAt)} />
            <InsetRow title="Last active" trailing={u.eventCount > 0 ? timeAgo(u.lastEventAt) : "Never tracked"} />
          </InsetList>

          <InsetList>
            <InsetRow
              leading={<RowIcon tone="blue"><LogIn size={15} /></RowIcon>}
              title="Open dashboard as this user"
              subtitle={
                u.role === "super_admin"
                  ? "The superadmin can't be opened"
                  : state.impersonateBlocked
                  ? "Admins can't be opened"
                  : undefined
              }
              disabled={state.impersonateBlocked || state.rowBusy}
              onClick={() => run(actions.enter)}
              chevron
            />
            <InsetRow
              leading={<RowIcon tone="violet"><CreditCard size={15} /></RowIcon>}
              title="Plan details"
              onClick={() => run(actions.openPlan)}
              chevron
            />
            <InsetRow
              leading={<RowIcon tone="teal"><Mail size={15} /></RowIcon>}
              title="Send email"
              disabled={state.rowBusy}
              onClick={() => run(actions.openMessage)}
              chevron
            />
          </InsetList>

          {isSuperAdmin && (
            <InsetList header="Security" footer="Use these only when someone is locked out. Codes and PINs are never visible to admins.">
              <InsetRow
                leading={<RowIcon tone="orange"><ShieldOff size={15} /></RowIcon>}
                title="Turn off two-factor"
                subtitle={u.totpEnabled ? "For a lost authenticator" : "Already off"}
                disabled={!u.totpEnabled || resetting2fa}
                onClick={() => run(actions.resetTwoFactor)}
              />
              <InsetRow
                leading={<RowIcon tone="orange"><LockKeyholeOpen size={15} /></RowIcon>}
                title="Reset screen lock"
                subtitle={u.screenLockEnabled ? "For a forgotten PIN" : "Already off"}
                disabled={!u.screenLockEnabled || resettingLock}
                onClick={() => run(actions.resetLock)}
              />
            </InsetList>
          )}

          <InsetList>
            <InsetRow
              leading={<RowIcon tone="red"><Trash2 size={15} /></RowIcon>}
              title="Delete account"
              subtitle={
                !isSuperAdmin
                  ? "Only the superadmin can delete accounts"
                  : state.isSelf
                  ? "You can't delete yourself"
                  : state.admin
                  ? "Admins can't be deleted"
                  : "Removes every workspace, site and event"
              }
              tone="danger"
              disabled={!isSuperAdmin || state.admin || state.isSelf || state.rowBusy}
              onClick={() => run(actions.remove)}
            />
          </InsetList>
        </>
      )}
    </PanelDrawer>
  );
}
