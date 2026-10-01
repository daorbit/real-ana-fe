import { useState } from "react";
import { Button, SegmentedControl, TextInput } from "@mantine/core";
import { Search, UserPlus } from "lucide-react";
import type { WorkspaceInvite, WorkspaceMember, WorkspaceRole } from "@/shared/types";
import { canManageRole, grantableRoles } from "./roles";
import { MemberRow } from "./MemberRow";
import { InviteRow } from "./InviteRow";
import classes from "./Members.module.css";

type View = "members" | "invites";

function matches(query: string, ...fields: string[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f.toLowerCase().includes(q));
}

export function MembersTable({
  members,
  invites,
  myRole,
  canAdmin,
  onRoleChange,
  onRemove,
  onWithdraw,
  onInvite,
}: {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  myRole: WorkspaceRole;
  canAdmin: boolean;
  onRoleChange: (memberId: string, role: WorkspaceRole) => void;
  onRemove: (member: WorkspaceMember) => void;
  onWithdraw: (inviteId: string) => void;
  onInvite: () => void;
}) {
  const [view, setView] = useState<View>("members");
  const [query, setQuery] = useState("");
  const grantable = grantableRoles(myRole);

  const shownMembers = members.filter((m) => matches(query, m.name, m.email));
  const shownInvites = invites.filter((i) => matches(query, i.email));
  const rows = view === "members" ? shownMembers.length : shownInvites.length;
  const solo = view === "members" && members.length === 1 && !invites.length && canAdmin && !query;

  return (
    <>
      <div className={classes.toolbar}>
        <SegmentedControl
          size="sm"
          radius="md"
          value={view}
          onChange={(v) => setView(v as View)}
          data={[
            { value: "members", label: `Members · ${members.length}` },
            { value: "invites", label: `Invitations · ${invites.length}` },
          ]}
        />
        <TextInput
          className={classes.search}
          size="sm"
          radius="md"
          placeholder={view === "members" ? "Search by name or email" : "Search by email"}
          leftSection={<Search size={15} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      </div>

      <div className={classes.table}>
        <div className={`${classes.grid} ${classes.head}`}>
          <span>{view === "members" ? "Member" : "Email"}</span>
          <span>Role</span>
          <span className={classes.colJoined}>{view === "members" ? "Joined" : "Invited"}</span>
          <span />
        </div>

        {view === "members"
          ? shownMembers.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                manageable={canManageRole(canAdmin, myRole, m.role)}
                grantable={grantable}
                onRoleChange={(next) => onRoleChange(m.id, next)}
                onRemove={() => onRemove(m)}
              />
            ))
          : shownInvites.map((inv) => (
              <InviteRow key={inv.id} invite={inv} canWithdraw={canAdmin} onWithdraw={() => onWithdraw(inv.id)} />
            ))}

        {rows === 0 && (
          <div className={classes.empty}>
            {query
              ? "No one matches that search."
              : view === "invites"
                ? "No pending invitations."
                : "No members yet."}
          </div>
        )}

        {solo && (
          <div className={classes.footer}>
            <span>You&apos;re the only one here. Invite teammates to share this workspace.</span>
            <Button size="xs" variant="light" radius="md" leftSection={<UserPlus size={14} />} onClick={onInvite}>
              Invite
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
