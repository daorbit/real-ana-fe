import { useState } from "react";
import { Button, Group } from "@mantine/core";
import { motion } from "framer-motion";
import { UserPlus, Users } from "lucide-react";
import { useGetMembersQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useMemberActions } from "../hooks/useMemberActions";
import { grantableRoles } from "../components/members/roles";
import { MembersOverview } from "../components/members/MembersOverview";
import { MembersTable } from "../components/members/MembersTable";
import { InviteModal } from "../components/members/InviteModal";
import { MembersSkeleton } from "../components/members/MembersSkeleton";

export default function Members() {
  useTitle("Members");
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const { data, isLoading } = useGetMembersQuery(active?._id ?? "", { skip: !active });
  const { invite, inviting, changeRole, remove, revoke } = useMemberActions(active);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={Users}
          title="No workspace selected"
          description="Choose a workspace from the switcher to see who has access and invite teammates."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  const members = data?.members ?? [];
  const invites = data?.invites ?? [];
  const myRole = data?.role ?? active.role ?? "viewer";
  const grantable = grantableRoles(myRole);

  return (
    <AppShell>
      <PageHeader
        title="Members"
        description={`Who can reach ${active.name}, and what they can do.`}
        docsPath={DOCS_SLUGS.workspaceMembers}
        actions={
          <Group gap="xs" wrap="nowrap">
            {canAdmin && (
              <Button radius="md" leftSection={<UserPlus size={15} />} onClick={() => setInviteOpen(true)}>
                Invite someone
              </Button>
            )}
            <PageHelpButton />
          </Group>
        }
      />

      {isLoading ? (
        <MembersSkeleton />
      ) : (
        <motion.div
          key={active._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
        >
          <MembersOverview workspaceName={active.name} members={members} invites={invites} myRole={myRole} />

          <MembersTable
            members={members}
            invites={invites}
            myRole={myRole}
            canAdmin={canAdmin}
            onRoleChange={changeRole}
            onRemove={(m) => remove(m.id, m.name || m.email, m.isSelf)}
            onWithdraw={revoke}
            onInvite={() => setInviteOpen(true)}
          />
        </motion.div>
      )}

      <InviteModal
        opened={inviteOpen}
        workspaceName={active.name}
        roles={grantable}
        sending={inviting}
        onClose={() => setInviteOpen(false)}
        onSend={invite}
      />
    </AppShell>
  );
}
