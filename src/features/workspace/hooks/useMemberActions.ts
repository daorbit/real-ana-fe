import { useNavigate } from "react-router-dom";
import {
  useInviteMemberMutation, useRevokeInviteMutation, useUpdateMemberRoleMutation, useRemoveMemberMutation,
} from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import type { WorkspaceRole } from "@/shared/types";

export function useMemberActions(workspace: { _id: string; name: string } | null | undefined) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteMember, { isLoading: inviting }] = useInviteMemberMutation();
  const [revokeInvite] = useRevokeInviteMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const invite = async (email: string, role: WorkspaceRole): Promise<boolean> => {
    if (!workspace) return false;
    trace(user?.id, "invite_member_clicked", "members", "invite");
    try {
      await inviteMember({ workspaceId: workspace._id, email, role }).unwrap();
      notify.success(`Invitation sent to ${email}.`);
      return true;
    } catch (err) {
      notify.error(errMessage(err, "Could not send the invitation."));
      return false;
    }
  };

  const changeRole = async (memberId: string, next: WorkspaceRole) => {
    if (!workspace) return;
    trace(user?.id, "change_member_role", "members", next);
    try {
      await updateRole({ workspaceId: workspace._id, memberId, role: next }).unwrap();
      notify.success("Role updated.");
    } catch (err) {
      notify.error(errMessage(err, "Could not change that role."));
    }
  };

  const remove = (memberId: string, name: string, isSelf: boolean) => {
    if (!workspace) return;
    confirmDelete({
      title: isSelf ? `Leave ${workspace.name}?` : `Remove ${name}?`,
      body: isSelf
        ? "You'll lose access to this workspace immediately, and you'll need a new invitation to get back in."
        : `${name} will lose access immediately. Anything they created stays in the workspace.`,
      confirmLabel: isSelf ? "Leave" : "Remove",
      onConfirm: async () => {
        trace(user?.id, isSelf ? "leave_workspace" : "remove_member", "members", "members");
        try {
          await removeMember({ workspaceId: workspace._id, memberId }).unwrap();
          notify.success(isSelf ? "You've left the workspace." : `${name} was removed.`);
          if (isSelf) navigate("/app");
        } catch (err) {
          notify.error(errMessage(err, "Could not remove them."));
        }
      },
    });
  };

  const revoke = async (inviteId: string) => {
    if (!workspace) return;
    trace(user?.id, "revoke_invite", "members", "members");
    try {
      await revokeInvite({ workspaceId: workspace._id, inviteId }).unwrap();
      notify.success("Invitation withdrawn.");
    } catch (err) {
      notify.error(errMessage(err, "Could not withdraw it."));
    }
  };

  return { invite, inviting, changeRole, remove, revoke };
}
