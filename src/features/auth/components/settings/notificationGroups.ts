import { Activity, CreditCard, Users, type LucideIcon } from "lucide-react";
import type { NotificationPreference, NotificationType } from "@/shared/types";

export type NotificationGroupId = "account" | "billing" | "activity";

export interface NotificationGroup {
  id: NotificationGroupId;
  titleKey: string;
  title: string;
  descriptionKey: string;
  description: string;
  icon: LucideIcon;
  types: NotificationType[];
}

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: "account",
    titleKey: "activity.prefGroup.account",
    title: "Account & team",
    descriptionKey: "activity.prefGroup.accountDesc",
    description: "Invitations, members, roles and security.",
    icon: Users,
    types: ["invite.received", "invite.accepted", "member.removed", "role.changed", "security.alert", "admin.message"],
  },
  {
    id: "billing",
    titleKey: "activity.prefGroup.billing",
    title: "Billing & usage",
    descriptionKey: "activity.prefGroup.billingDesc",
    description: "Payments, plan renewals and usage limits.",
    icon: CreditCard,
    types: ["plan.ending", "payment.received", "payment.failed", "quota.exceeded"],
  },
  {
    id: "activity",
    titleKey: "activity.prefGroup.activity",
    title: "Activity",
    descriptionKey: "activity.prefGroup.activityDesc",
    description: "Reports, SEO, tracking, posts, leads and form submissions.",
    icon: Activity,
    types: [
      "report.ready",
      "seo.audit.done",
      "seo.rank.changed",
      "tracking.stopped",
      "social.post.failed",
      "lead.captured",
      "form.submission",
    ],
  },
];

export function groupPreferences(items: NotificationPreference[]) {
  const known = new Set(NOTIFICATION_GROUPS.flatMap((g) => g.types));
  return NOTIFICATION_GROUPS.map((group) => ({
    group,
    items: items.filter(
      (item) => group.types.includes(item.type) || (group.id === "activity" && !known.has(item.type)),
    ),
  }));
}
