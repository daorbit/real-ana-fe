import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Text, Group, Button, Card, ActionIcon, Modal, TextInput, Select,
  Stack, Center, Badge, Tooltip, Box, ThemeIcon, SimpleGrid,
  SegmentedControl, Divider,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  UserPlus, Trash2, Mail, Clock, LogOut, Users, Eye, Pencil, Shield, Star, X,
} from "lucide-react";
import {
  useGetMembersQuery, useInviteMemberMutation, useRevokeInviteMutation,
  useUpdateMemberRoleMutation, useRemoveMemberMutation,
} from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { MembersSkeleton } from "@/shared/ui/Skeletons";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { PageHeader } from "@/shared/ui/Page";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { shortDate } from "@/shared/lib";
import { ROLE_RANK, type WorkspaceRole } from "@/shared/types";

/**
 * Who can reach this workspace.
 *
 * Scoped to the active workspace like every other page — switching in the
 * sidebar switches whose team this is. Everyone can see the list, because
 * knowing who else reads your analytics is not privileged information to the
 * people already in the room; only changing it is gated.
 */

/**
 * How each role is presented: its icon, its colour, and what it actually
 * permits.
 *
 * Kept as one table rather than scattered ternaries so a role never renders as
 * one colour in the list and another in the picker — and so adding a role is
 * one entry, not a hunt through the file.
 */
const ROLE_META: Record<
  WorkspaceRole,
  { icon: typeof Eye; color: string; short: string; blurb: string }
> = {
  owner: {
    icon: Star,
    color: "emerald",
    short: "Full control",
    blurb: "Created the workspace. Full control, including deleting it.",
  },
  admin: {
    icon: Shield,
    color: "violet",
    short: "Manages people and settings",
    blurb: "Can do everything an editor can, plus invite people, manage sharing and API keys.",
  },
  editor: {
    icon: Pencil,
    color: "blue",
    short: "Adds sites and runs audits",
    blurb: "Can add sites, run audits and crawls, and manage goals and reports.",
  },
  viewer: {
    icon: Eye,
    color: "gray",
    short: "Read-only",
    blurb: "Sees all the analytics and reports. Cannot change anything.",
  },
};

/** Roles that can be handed out. Ownership is not transferable here. */
const GRANTABLE: WorkspaceRole[] = ["admin", "editor", "viewer"];

function RoleBadge({ role }: { role: WorkspaceRole }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <Tooltip label={meta.blurb} withArrow multiline w={250} position="left">
      <Badge
        variant="light"
        color={meta.color}
        tt="capitalize"
        leftSection={<Icon size={11} />}
        style={{ cursor: "default" }}
      >
        {role}
      </Badge>
    </Tooltip>
  );
}

/**
 * The role picker: one row of choices, with the meaning of the current one
 * spelled out beneath.
 *
 * A segmented control rather than a stack of cards — the three roles are one
 * decision on a single axis (how much can they change), and laying them side by
 * side is what makes that axis visible. The description sits below and swaps
 * with the selection, so the consequence of the choice is always on screen
 * without three paragraphs competing for attention.
 */
function RolePicker({
  value,
  options,
  onChange,
}: {
  value: WorkspaceRole;
  options: WorkspaceRole[];
  onChange: (role: WorkspaceRole) => void;
}) {
  const meta = ROLE_META[value];
  const Icon = meta.icon;

  return (
    <Stack gap={10}>
      <SegmentedControl
        fullWidth
        radius="md"
        value={value}
        onChange={(v) => onChange(v as WorkspaceRole)}
        data={options.map((role) => {
          const RoleIcon = ROLE_META[role].icon;
          return {
            value: role,
            label: (
              <Group gap={6} justify="center" wrap="nowrap">
                <RoleIcon size={13} />
                <Text size="sm" fw={500} tt="capitalize">{role}</Text>
              </Group>
            ),
          };
        })}
      />

      <Group
        gap="sm"
        wrap="nowrap"
        align="flex-start"
        p="sm"
        style={{
          background: "var(--mantine-color-default-hover)",
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <ThemeIcon variant="light" color={meta.color} size="md" radius="md">
          <Icon size={14} />
        </ThemeIcon>
        <Text size="xs" c="dimmed" lh={1.5}>{meta.blurb}</Text>
      </Group>
    </Stack>
  );
}

export default function Members() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();

  const { data, isLoading } = useGetMembersQuery(active?._id ?? "", { skip: !active });
  const [invite, { isLoading: inviting }] = useInviteMemberMutation();
  const [revokeInvite] = useRevokeInviteMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("viewer");

  const members = data?.members ?? [];
  const invites = data?.invites ?? [];
  const myRole = data?.role ?? active?.role ?? "viewer";

  /**
   * An admin cannot create or manage a peer — only the owner can. Mirrors the
   * server, which refuses the same thing; this only keeps the UI from offering
   * an action that would come back as a 403.
   */
  const canManage = (targetRole: WorkspaceRole) =>
    canAdmin &&
    targetRole !== "owner" &&
    (myRole === "owner" || ROLE_RANK[targetRole] < ROLE_RANK[myRole]);

  const grantable = GRANTABLE.filter(
    (r) => myRole === "owner" || ROLE_RANK[r] < ROLE_RANK[myRole],
  );

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    try {
      await invite({ workspaceId: active._id, email: email.trim(), role }).unwrap();
      notify.success(`Invitation sent to ${email.trim()}.`);
      setModal(false);
      setEmail("");
      setRole("viewer");
    } catch (err) {
      notify.error(errMessage(err, "Could not send the invitation."));
    }
  };

  const changeRole = async (memberId: string, next: WorkspaceRole) => {
    if (!active) return;
    try {
      await updateRole({ workspaceId: active._id, memberId, role: next }).unwrap();
      notify.success("Role updated.");
    } catch (err) {
      notify.error(errMessage(err, "Could not change that role."));
    }
  };

  const remove = (memberId: string, name: string, isSelf: boolean) => {
    if (!active) return;
    confirmDelete({
      title: isSelf ? `Leave ${active.name}?` : `Remove ${name}?`,
      body: isSelf
        ? "You'll lose access to this workspace immediately, and you'll need a new invitation to get back in."
        : `${name} will lose access immediately. Anything they created stays in the workspace.`,
      confirmLabel: isSelf ? "Leave" : "Remove",
      onConfirm: async () => {
        try {
          await removeMember({ workspaceId: active._id, memberId }).unwrap();
          notify.success(isSelf ? "You've left the workspace." : `${name} was removed.`);
          // Leaving means this page is about a workspace you can no longer
          // reach — the list refetch moves the sidebar off it.
          if (isSelf) navigate("/app");
        } catch (err) {
          notify.error(errMessage(err, "Could not remove them."));
        }
      },
    });
  };

  if (!active) {
    return (
      <AppShell>
        <Center py={64}>
          <Text c="dimmed">No workspace selected.</Text>
        </Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Members"
        description={`Who can reach ${active.name}, and what they can do.`}
        actions={
          canAdmin && (
            <Button leftSection={<UserPlus size={15} />} onClick={() => setModal(true)}>
              Invite someone
            </Button>
          )
        }
      />

      {isLoading ? (
        <MembersSkeleton />
      ) : (
        <motion.div
          key={active._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <Stack gap="xl">
            {/* How many people, and what this account may do here. Two facts
                someone opening this page is checking, so they lead. */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon variant="light" color="emerald" size={38} radius="md">
                    <Users size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fz={22} fw={700} lh={1.1}>{members.length}</Text>
                    <Text size="xs" c="dimmed">
                      {members.length === 1 ? "person has access" : "people have access"}
                      {invites.length > 0 && ` · ${invites.length} invited`}
                    </Text>
                  </div>
                </Group>
              </Card>

              <Card withBorder radius="md" padding="md">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    color={ROLE_META[myRole].color}
                    size={38}
                    radius="md"
                  >
                    {(() => {
                      const Icon = ROLE_META[myRole].icon;
                      return <Icon size={18} />;
                    })()}
                  </ThemeIcon>
                  <div style={{ minWidth: 0 }}>
                    <Text fz={17} fw={700} lh={1.2} tt="capitalize">{myRole}</Text>
                    <Text size="xs" c="dimmed" lh={1.35}>
                      Your access · {ROLE_META[myRole].short.toLowerCase()}
                    </Text>
                  </div>
                </Group>
              </Card>
            </SimpleGrid>

            {/* people */}
            <div>
              <Text fw={600} size="sm" mb="sm">People</Text>
              <Stack gap="xs">
                {members.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 6) * 0.04, duration: 0.25 }}
                  >
                    <Card withBorder radius="md" padding="sm">
                      <Group justify="space-between" wrap="nowrap" gap="sm">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                          <UserAvatar
                            src={m.avatarUrl}
                            name={m.name || m.email}
                            radius="xl"
                            size={40}
                          />
                          <div style={{ minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap">
                              <Text size="sm" fw={600} truncate>
                                {m.name || m.email}
                              </Text>
                              {m.isSelf && (
                                <Badge size="xs" variant="default" radius="sm">You</Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed" truncate>
                              {m.email} · joined {shortDate(m.joinedAt)}
                            </Text>
                          </div>
                        </Group>

                        <Group gap="xs" wrap="nowrap">
                          {canManage(m.role) ? (
                            <Select
                              size="xs"
                              w={108}
                              value={m.role}
                              data={grantable.map((r) => ({ value: r, label: r }))}
                              onChange={(v) => v && changeRole(m.id, v as WorkspaceRole)}
                              allowDeselect={false}
                              styles={{ input: { textTransform: "capitalize" } }}
                            />
                          ) : (
                            <RoleBadge role={m.role} />
                          )}

                          {/* Leaving is always your own to do; removing others
                              is not. The owner can do neither — they delete the
                              workspace instead. */}
                          {(m.isSelf ? m.role !== "owner" : canManage(m.role)) && (
                            <Tooltip
                              label={m.isSelf ? "Leave workspace" : "Remove"}
                              withArrow
                            >
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => remove(m.id, m.name || m.email, m.isSelf)}
                              >
                                {m.isSelf ? <LogOut size={15} /> : <Trash2 size={15} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            </div>

            {/* invitations */}
            {invites.length > 0 && (
              <div>
                <Group gap={7} mb="sm">
                  <Clock size={14} />
                  <Text fw={600} size="sm">Awaiting acceptance</Text>
                </Group>
                <Stack gap="xs">
                  {invites.map((inv) => (
                    <Card
                      key={inv.id}
                      withBorder
                      radius="md"
                      padding="sm"
                      // Dashed, so a pending invite is visibly not yet a member
                      // even before the words are read.
                      style={{ borderStyle: "dashed" }}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="sm">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                          <ThemeIcon variant="light" color="gray" size={40} radius="xl">
                            <Mail size={16} />
                          </ThemeIcon>
                          <div style={{ minWidth: 0 }}>
                            <Text size="sm" fw={600} truncate>{inv.email}</Text>
                            <Text size="xs" c="dimmed">
                              Invited {shortDate(inv.invitedAt)} · expires{" "}
                              {shortDate(inv.expiresAt)}
                            </Text>
                          </div>
                        </Group>

                        <Group gap="xs" wrap="nowrap">
                          <RoleBadge role={inv.role} />
                          {canAdmin && (
                            <Tooltip label="Withdraw invitation" withArrow>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={async () => {
                                  try {
                                    await revokeInvite({
                                      workspaceId: active._id,
                                      inviteId: inv.id,
                                    }).unwrap();
                                    notify.success("Invitation withdrawn.");
                                  } catch (err) {
                                    notify.error(errMessage(err, "Could not withdraw it."));
                                  }
                                }}
                              >
                                <X size={15} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </div>
            )}

            {/* Only shown when there is nobody to invite them — an admin looking
                at a one-person workspace already has the button above. */}
            {members.length === 1 && !invites.length && canAdmin && (
              <Card withBorder radius="md" padding="lg">
                <Stack align="center" gap={6}>
                  <ThemeIcon variant="light" color="gray" size={48} radius="md">
                    <Users size={22} />
                  </ThemeIcon>
                  <Text fw={600} mt={4}>You&apos;re the only one here</Text>
                  <Text c="dimmed" size="sm" ta="center" maw={380}>
                    Invite teammates to share this workspace. They&apos;ll see the same
                    analytics — you decide whether they can change anything.
                  </Text>
                  <Button
                    variant="light"
                    mt="sm"
                    leftSection={<UserPlus size={15} />}
                    onClick={() => setModal(true)}
                  >
                    Invite someone
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </motion.div>
      )}

      <Modal
        opened={modal}
        onClose={() => setModal(false)}
        title="Invite to this workspace"
        radius="md"
        centered
      >
        <form onSubmit={send}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="teammate@company.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              description="They'll get a link. If they don't have an account yet, they can create one from it."
            />

            <Box>
              <Text size="sm" fw={500} mb={6}>Role</Text>
              <RolePicker value={role} options={grantable} onChange={setRole} />
            </Box>

            <Divider />

            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setModal(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={inviting} leftSection={<UserPlus size={15} />}>
                Send invitation
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AppShell>
  );
}
