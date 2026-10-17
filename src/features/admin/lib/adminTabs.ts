import { CreditCard, Database, Gift, Mail, PlayCircle, Users, type LucideIcon } from "lucide-react";

export type AdminTabId = "email" | "impersonate" | "demo-usage" | "plans" | "referrals" | "database";

export const ADMIN_TOOLS_PATH = "/app/admin-tools";

export const ADMIN_TABS: { id: AdminTabId; labelKey: string; label: string; icon: LucideIcon; legacyPath: string }[] = [
  { id: "email", labelKey: "nav.adminBroadcast", label: "Email users", icon: Mail, legacyPath: "/app/admin/broadcast" },
  { id: "impersonate", labelKey: "nav.viewAsUser", label: "Impersonate", icon: Users, legacyPath: "/app/impersonate" },
  { id: "demo-usage", labelKey: "nav.demoUsage", label: "Demo usage", icon: PlayCircle, legacyPath: "/app/demo-usage" },
  { id: "plans", labelKey: "nav.adminBilling", label: "Plans & addons", icon: CreditCard, legacyPath: "/app/admin/billing" },
  { id: "referrals", labelKey: "nav.adminReferrals", label: "Referrals", icon: Gift, legacyPath: "/app/admin/referrals" },
  { id: "database", labelKey: "nav.adminDatabase", label: "Database", icon: Database, legacyPath: "/app/admin/database" },
];

export function adminToolPath(tab: AdminTabId = "email"): string {
  return `${ADMIN_TOOLS_PATH}/${tab}`;
}

export function isAdminTab(value: string | undefined): value is AdminTabId {
  return ADMIN_TABS.some((t) => t.id === value);
}
