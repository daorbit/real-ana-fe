import { Code2, Globe, KeyRound, LayoutGrid, Search, Target, Users, type LucideIcon } from "lucide-react";
import { LeadMagnetIcon } from "@/app/shell/icons";
import type { AuditCategory } from "@/shared/types";

export type WorkspaceAuditCategory = Exclude<AuditCategory, "account">;

export const CATEGORY_META: Record<AuditCategory, { label: string; icon: LucideIcon; examples: string }> = {
  account: { label: "Account", icon: KeyRound, examples: "Sign-ins, passwords, two-factor" },
  members: { label: "Members", icon: Users, examples: "Invites, roles, people leaving" },
  workspace: { label: "Workspace", icon: LayoutGrid, examples: "Name, sharing, branding, media" },
  sites: { label: "Sites", icon: Globe, examples: "Sites added and removed" },
  analytics: { label: "Analytics", icon: Target, examples: "Goals, dashboards, reports, segments" },
  seo: { label: "SEO", icon: Search, examples: "Audits, competitors, Search Console" },
  developers: { label: "API keys", icon: Code2, examples: "Keys created, renamed, revoked" },
  forms: { label: "Lead capture", icon: LeadMagnetIcon, examples: "Forms, responses, payments, apps" },
};

export const WORKSPACE_CATEGORIES: WorkspaceAuditCategory[] = [
  "members",
  "analytics",
  "forms",
  "seo",
  "sites",
  "workspace",
  "developers",
];
