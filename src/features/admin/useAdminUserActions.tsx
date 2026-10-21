import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteAdminUserMutation,
  useAdminReset2faMutation,
  useAdminResetScreenLockMutation,
  useSetAdminUserRoleMutation,
} from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import type { AdminUser, Role } from "@/shared/types";
import { ROLE_LABELS } from "./lib/userRoles";
import { identityProof } from "@/features/auth/components/settings/identityProof";

export type AdminUserRow = {
  admin: boolean;
  isSelf: boolean;
  rowBusy: boolean;
  impersonateBlocked: boolean;
};

export function useAdminUserActions() {
  const { user, impersonate } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<AdminUser | null>(null);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);
  const [granting, setGranting] = useState<AdminUser | null>(null);
  const [deleteUser] = useDeleteAdminUserMutation();
  const [reset2fa, { isLoading: resetting2fa }] = useAdminReset2faMutation();
  const [resetScreenLock, { isLoading: resettingLock }] = useAdminResetScreenLockMutation();
  const [setRole, { isLoading: changingRole }] = useSetAdminUserRoleMutation();
  const isSuperAdmin = user?.role === "super_admin" && !user?.impersonating;

  const rowState = (u: AdminUser): AdminUserRow => ({
    admin: u.role === "admin" || u.role === "super_admin",
    isSelf: u.id === user?.id,
    rowBusy: busy === u.id || deleting === u.id,
    impersonateBlocked: u.role === "super_admin" || (u.role === "admin" && !isSuperAdmin),
  });

  const enter = async (u: AdminUser) => {
    setBusy(u.id);
    try {
      await impersonate(u.id);
      navigate("/app");
      notify.success(`You are now viewing as ${u.email}.`, "Impersonating");
    } catch (e) {
      notify.error(errMessage(e, "Could not switch to that user."));
    } finally {
      setBusy(null);
    }
  };

  const openPlan = (u: AdminUser) => {
    setPlanUser(u);
  };

  const openMessage = (u: AdminUser) => {
    setMessaging(u);
  };

  const resetTwoFactor = (u: AdminUser) => {
    confirmDelete({
      title: "Turn off two-factor authentication?",
      confirmLabel: "Turn off 2FA",
      body: (
        <>
          Turns off 2FA for <b>{u.name}</b> ({u.email}) so they can sign in
          with just their password again. Use this when someone has lost
          their authenticator and used up their backup codes — the codes
          themselves are never visible to anyone, including admins, so this
          reset is the only way back in.
        </>
      ),
      onConfirm: async () => {
        try {
          await reset2fa(u.id).unwrap();
          notify.success(`Two-factor authentication turned off for ${u.email}.`, "2FA reset");
        } catch (e) {
          notify.error(errMessage(e, "Could not turn off 2FA for that account."));
        }
      },
    });
  };

  const resetLock = (u: AdminUser) => {
    confirmDelete({
      title: "Reset the screen lock?",
      confirmLabel: "Reset lock",
      body: (
        <>
          Clears the screen-lock PIN and turns the idle lock off for{" "}
          <b>{u.name}</b> ({u.email}). Use this when someone is locked out
          with no working PIN or authenticator code — the PIN is never
          visible to anyone, including admins.
        </>
      ),
      onConfirm: async () => {
        try {
          await resetScreenLock(u.id).unwrap();
          notify.success(`Screen lock reset for ${u.email}.`, "Screen lock reset");
        } catch (e) {
          notify.error(errMessage(e, "Could not reset the screen lock for that account."));
        }
      },
    });
  };

  const applyRole = async (u: AdminUser, role: Role, secret?: string): Promise<boolean> => {
    try {
      await setRole({ userId: u.id, role, proof: secret && user ? identityProof(user, secret) : undefined }).unwrap();
      notify.success(`${u.email} is now ${ROLE_LABELS[role].toLowerCase()}.`, "Role changed");
      return true;
    } catch (e) {
      notify.error(errMessage(e, "Could not change the role."));
      return false;
    }
  };

  const changeRole = (u: AdminUser, role: Role) => {
    if (role === u.role) return;
    if (role === "super_admin") {
      setGranting(u);
      return;
    }
    confirmDelete({
      title: `Change role to ${ROLE_LABELS[role]}?`,
      confirmLabel: "Change role",
      confirmColor: "blue",
      body: (
        <>
          <b>{u.name}</b> ({u.email}) goes from {ROLE_LABELS[u.role]} to {ROLE_LABELS[role]}. The change applies
          on their next request.
        </>
      ),
      onConfirm: async () => {
        await applyRole(u, role);
      },
    });
  };

  const confirmGrant = (secret: string) => (granting ? applyRole(granting, "super_admin", secret) : Promise.resolve(false));

  const remove = (u: AdminUser) => {
    confirmDelete({
      title: "Delete this account?",
      confirmLabel: "Delete account",
      body: (
        <>
          <b>{u.name}</b> ({u.email}) and everything they own — every workspace,
          site, API key, and all recorded analytics — will be permanently
          deleted. This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        setDeleting(u.id);
        try {
          await deleteUser(u.id).unwrap();
          notify.success(`${u.email} has been deleted.`, "Account deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete that account."));
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  return {
    isSuperAdmin,
    busy,
    deleting,
    resetting2fa,
    resettingLock,
    changingRole,
    messaging,
    planUser,
    granting,
    confirmGrant,
    closeGrant: () => setGranting(null),
    closeMessage: () => setMessaging(null),
    closePlan: () => setPlanUser(null),
    rowState,
    enter,
    openPlan,
    openMessage,
    resetTwoFactor,
    resetLock,
    changeRole,
    remove,
  };
}

export type AdminUserActions = ReturnType<typeof useAdminUserActions>;
