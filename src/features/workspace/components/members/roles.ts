import { Eye, Pencil, Shield, Star } from "lucide-react";
import { ROLE_RANK, type WorkspaceRole } from "@/shared/types";

export const ROLE_META: Record<WorkspaceRole, { icon: typeof Eye; short: string; blurb: string }> = {
  owner: {
    icon: Star,
    short: "Full control",
    blurb: "Created the workspace. Full control, including deleting it.",
  },
  admin: {
    icon: Shield,
    short: "Manages people and settings",
    blurb: "Can do everything an editor can, plus invite people, manage sharing and API keys.",
  },
  editor: {
    icon: Pencil,
    short: "Adds sites and runs audits",
    blurb: "Can add sites, run audits and crawls, and manage goals and reports.",
  },
  viewer: {
    icon: Eye,
    short: "Read-only",
    blurb: "Sees all the analytics and reports. Cannot change anything.",
  },
};

export const ROLE_ORDER: WorkspaceRole[] = ["owner", "admin", "editor", "viewer"];

const GRANTABLE: WorkspaceRole[] = ["admin", "editor", "viewer"];

export function grantableRoles(myRole: WorkspaceRole): WorkspaceRole[] {
  return GRANTABLE.filter((r) => myRole === "owner" || ROLE_RANK[r] < ROLE_RANK[myRole]);
}

export function canManageRole(canAdmin: boolean, myRole: WorkspaceRole, targetRole: WorkspaceRole): boolean {
  return canAdmin && targetRole !== "owner" && (myRole === "owner" || ROLE_RANK[targetRole] < ROLE_RANK[myRole]);
}

export function roleLabel(role: WorkspaceRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
