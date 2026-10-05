import type { MembersResponse, WorkspaceMember } from "@/shared/types";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;

function avatar(seed: string): string {
  return `https://i.pravatar.cc/100?u=${seed}`;
}

/**
 * The demo viewer is `demoWorkspaces[0]`'s owner, so they are not repeated
 * here as a member row — these are the rest of the team.
 */
const demoMembers: WorkspaceMember[] = [
  {
    id: "demo-member-1",
    userId: "demo-user-priya",
    name: "Priya Shah",
    email: "priya@acme.example",
    avatarUrl: avatar("demo-priya-shah"),
    role: "admin",
    joinedAt: iso(95 * DAY),
    isSelf: false,
  },
  {
    id: "demo-member-2",
    userId: "demo-user-marcus",
    name: "Marcus Webb",
    email: "marcus@acme.example",
    avatarUrl: avatar("demo-marcus-webb"),
    role: "editor",
    joinedAt: iso(62 * DAY),
    isSelf: false,
  },
  {
    id: "demo-member-3",
    userId: "demo-user-hinata",
    name: "Hinata Tachibana",
    email: "hinata@acme.example",
    avatarUrl: avatar("demo-hinata-tachibana"),
    role: "viewer",
    joinedAt: iso(30 * DAY),
    isSelf: false,
  },
];

export function demoMembersResponse(): MembersResponse {
  return {
    role: "owner",
    members: demoMembers,
    invites: [
      {
        id: "demo-invite-1",
        email: "diego@northwind.io",
        role: "editor",
        invitedAt: iso(3 * DAY),
        expiresAt: iso(-4 * DAY),
      },
    ],
  };
}
