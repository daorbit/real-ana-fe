import { ActionIcon, Button, Loader, Tooltip } from "@mantine/core";
import { CreditCard, LockKeyholeOpen, LogIn, Mail, ShieldOff, Trash2 } from "lucide-react";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import classes from "../Admin.module.css";

interface Props {
  user: AdminUser;
  actions: AdminUserActions;
}

export function UserRowActions({ user: u, actions }: Props) {
  const { isSuperAdmin, busy, deleting, resetting2fa, resettingLock } = actions;
  const { admin, isSelf, rowBusy, impersonateBlocked } = actions.rowState(u);

  return (
    <div className={classes.rowActions}>
      <Tooltip
        label={
          u.role === "super_admin"
            ? "The superadmin can't be opened"
            : impersonateBlocked
            ? "Admins can't be opened"
            : "Open dashboard as this user"
        }
        withArrow
      >
        <Button
          size="xs"
          variant="light"
          color="emerald"
          leftSection={busy === u.id ? <Loader size={12} color="emerald" /> : <LogIn size={14} />}
          disabled={impersonateBlocked || rowBusy}
          onClick={() => actions.enter(u)}
        >
          Open
        </Button>
      </Tooltip>
      <Tooltip label="Plan details" withArrow>
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          radius="md"
          aria-label="Plan details"
          onClick={() => actions.openPlan(u)}
        >
          <CreditCard size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={`Email ${u.email}`} withArrow>
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          radius="md"
          disabled={rowBusy}
          aria-label={`Email ${u.email}`}
          onClick={() => actions.openMessage(u)}
        >
          <Mail size={16} />
        </ActionIcon>
      </Tooltip>
      {isSuperAdmin && (
        <Tooltip
          label={
            !u.totpEnabled
              ? "2FA is already off for this account"
              : "Turn off 2FA — for a lost authenticator with no backup codes left"
          }
          withArrow
        >
          <ActionIcon
            variant="light"
            color="orange"
            size="lg"
            radius="md"
            disabled={!u.totpEnabled || resetting2fa}
            onClick={() => actions.resetTwoFactor(u)}
            aria-label={`Reset two-factor for ${u.email}`}
          >
            <ShieldOff size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      {isSuperAdmin && (
        <Tooltip
          label={
            !u.screenLockEnabled
              ? "Screen lock is already off for this account"
              : "Reset screen lock — for someone locked out with no working PIN"
          }
          withArrow
        >
          <ActionIcon
            variant="light"
            color="orange"
            size="lg"
            radius="md"
            disabled={!u.screenLockEnabled || resettingLock}
            onClick={() => actions.resetLock(u)}
            aria-label={`Reset screen lock for ${u.email}`}
          >
            <LockKeyholeOpen size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      <Tooltip
        label={
          !isSuperAdmin
            ? "Only the superadmin can delete accounts"
            : isSelf
            ? "You can't delete yourself"
            : admin
            ? "Admins can't be deleted"
            : "Delete this account"
        }
        withArrow
      >
        <ActionIcon
          variant="light"
          color="red"
          size="lg"
          radius="md"
          disabled={!isSuperAdmin || admin || isSelf || rowBusy}
          onClick={() => actions.remove(u)}
          aria-label={`Delete ${u.email}`}
        >
          {deleting === u.id ? <Loader size={14} color="red" /> : <Trash2 size={16} />}
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
