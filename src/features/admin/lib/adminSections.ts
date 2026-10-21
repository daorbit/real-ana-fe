import { BellRing, CreditCard, Database, Gift, Mail, Package, PlayCircle, Ticket, Users, type LucideIcon } from "lucide-react";

export type AdminSectionId = "users" | "email" | "plans" | "addons" | "coupons" | "referrals" | "demo" | "database" | "alerts";

export type AdminTone = "blue" | "violet" | "teal" | "orange" | "pink" | "grape" | "cyan" | "gray";

export type AdminSectionMeta = {
  id: AdminSectionId;
  labelKey: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: AdminTone;
};

export const ADMIN_TOOLS_PATH = "/app/admin-tools";

export const ADMIN_GROUPS: { label: string; sections: AdminSectionMeta[] }[] = [
  {
    label: "People",
    sections: [
      {
        id: "users",
        labelKey: "nav.adminUsers",
        label: "Users",
        description: "Every account on the platform. Open the dashboard as someone, change their plan, message or remove them.",
        icon: Users,
        tone: "blue",
      },
      {
        id: "email",
        labelKey: "nav.adminBroadcast",
        label: "Email",
        description: "Send a message to a group of users, a list of addresses, or one person.",
        icon: Mail,
        tone: "violet",
      },
    ],
  },
  {
    label: "Revenue",
    sections: [
      {
        id: "plans",
        labelKey: "nav.adminPlans",
        label: "Plans",
        description: "What each plan costs. Limits and features are set in code.",
        icon: CreditCard,
        tone: "teal",
      },
      {
        id: "addons",
        labelKey: "nav.adminAddons",
        label: "Add-on packs",
        description: "Extra audits, crawls, Orbit questions and more, sold on the Billing page.",
        icon: Package,
        tone: "orange",
      },
      {
        id: "coupons",
        labelKey: "nav.adminCoupons",
        label: "Coupons",
        description: "Discount codes customers can enter at checkout.",
        icon: Ticket,
        tone: "pink",
      },
      {
        id: "referrals",
        labelKey: "nav.adminReferrals",
        label: "Referrals",
        description: "The referral program: rewards, who referred whom, and your top referrers.",
        icon: Gift,
        tone: "grape",
      },
    ],
  },
  {
    label: "System",
    sections: [
      {
        id: "demo",
        labelKey: "nav.demoUsage",
        label: "Demo",
        description: "How the public demo is being used, and how many demos one visitor may start a day.",
        icon: PlayCircle,
        tone: "cyan",
      },
      {
        id: "database",
        labelKey: "nav.adminDatabase",
        label: "Database",
        description: "Storage used against the plan limit, and Workers AI usage.",
        icon: Database,
        tone: "gray",
      },
      {
        id: "alerts",
        labelKey: "nav.adminAlerts",
        label: "System alerts",
        description: "Where to send a Telegram message when an API fails, a cron job breaks or a service goes down.",
        icon: BellRing,
        tone: "orange",
      },
    ],
  },
];

export const ADMIN_SECTIONS: AdminSectionMeta[] = ADMIN_GROUPS.flatMap((g) => g.sections);

const LIMITED_SECTIONS: AdminSectionId[] = ["users", "email"];

export function sectionAllowed(id: AdminSectionId, access: "full" | "limited" | null): boolean {
  if (access === "full") return true;
  return access === "limited" && LIMITED_SECTIONS.includes(id);
}

export function adminGroupsFor(access: "full" | "limited" | null) {
  return ADMIN_GROUPS.map((g) => ({ ...g, sections: g.sections.filter((s) => sectionAllowed(s.id, access)) })).filter(
    (g) => g.sections.length > 0,
  );
}

export const DEFAULT_ADMIN_SECTION: AdminSectionId = "users";

export const LEGACY_ADMIN_PATHS: { path: string; section: AdminSectionId }[] = [
  { path: "/app/impersonate", section: "users" },
  { path: "/app/admin/broadcast", section: "email" },
  { path: "/app/admin/billing", section: "plans" },
  { path: "/app/admin/referrals", section: "referrals" },
  { path: "/app/demo-usage", section: "demo" },
  { path: "/app/admin/database", section: "database" },
];

const SECTION_ALIASES: Record<string, AdminSectionId> = {
  impersonate: "users",
  "demo-usage": "demo",
};

export function adminSectionPath(section: AdminSectionId = DEFAULT_ADMIN_SECTION): string {
  return `${ADMIN_TOOLS_PATH}/${section}`;
}

export function adminUserPath(userId: string): string {
  return `${ADMIN_TOOLS_PATH}/users/${userId}`;
}

export function resolveAdminSection(value: string | undefined): AdminSectionId | null {
  if (!value) return null;
  if (ADMIN_SECTIONS.some((s) => s.id === value)) return value as AdminSectionId;
  return SECTION_ALIASES[value] ?? null;
}

export function adminSectionMeta(id: AdminSectionId): AdminSectionMeta {
  return ADMIN_SECTIONS.find((s) => s.id === id)!;
}
