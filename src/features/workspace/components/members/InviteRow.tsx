import { Mail, X } from "lucide-react";
import { shortDate } from "@/shared/lib";
import type { WorkspaceInvite } from "@/shared/types";
import { RowMenu } from "./RowMenu";
import { roleLabel } from "./roles";
import classes from "./Members.module.css";

export function InviteRow({
  invite,
  canWithdraw,
  onWithdraw,
}: {
  invite: WorkspaceInvite;
  canWithdraw: boolean;
  onWithdraw: () => void;
}) {
  return (
    <div className={`${classes.grid} ${classes.row}`}>
      <div className={classes.member}>
        <span className={classes.inviteMark}>
          <Mail size={15} />
        </span>
        <div className={classes.memberText}>
          <div className={classes.name}>{invite.email}</div>
          <div className={classes.email}>Expires {shortDate(invite.expiresAt)}</div>
        </div>
      </div>

      <span className={classes.roleText}>{roleLabel(invite.role)}</span>

      <span className={`${classes.date} ${classes.colJoined}`}>{shortDate(invite.invitedAt)}</span>

      <div>
        {canWithdraw && (
          <RowMenu
            label={`Actions for ${invite.email}`}
            actionLabel="Withdraw invitation"
            icon={<X size={14} />}
            onAction={onWithdraw}
          />
        )}
      </div>
    </div>
  );
}
