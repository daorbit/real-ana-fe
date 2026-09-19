import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  CalendarClock,
  FileText,
  Gauge,
  RefreshCw,
  Megaphone,
  SatelliteDish,
  SendHorizontal,
  ShieldCheck,
  TrendingUp,
  UserMinus,
  UserPlus,
  UserRoundCheck,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/shared/types";
import formSubmissionLogo from "@/assets/banners/notications-logos/form-submissions.svg";
import paymentReceivedLogo from "@/assets/banners/notications-logos/payments-and-receipts.svg";
import reportReadyLogo from "@/assets/banners/notications-logos/scheduled-reports.svg";
import seoAuditLogo from "@/assets/banners/notications-logos/seo-audits.svg";


/**
 * How loud a row is allowed to be.
 *
 * Carried here rather than left to each type's colour so the panel has one
 * answer to "does this need acting on". Without it every new type picks its own
 * red and the scale drifts until nothing reads as urgent.
 */
export type NotificationSeverity = "info" | "warning" | "critical";

export type NotificationVisual = {
  icon: LucideIcon;
  /** A Mantine palette name, used for the icon and its wash. */
  color: string;

  severity?: NotificationSeverity;

  image?: string;
};

export const NOTIFICATION_VISUALS: Record<NotificationType, NotificationVisual> = {
  "invite.received": { icon: UserPlus, color: "violet" },
  "invite.accepted": { icon: UserPlus, color: "teal" },
  "member.removed": { icon: UserMinus, color: "gray", severity: "warning" },
  "role.changed": { icon: ShieldCheck, color: "violet" },
  "report.ready": { icon: FileText, color: "gray", image: reportReadyLogo },
  "plan.ending": { icon: CalendarClock, color: "orange", severity: "warning" },
  "payment.received": { icon: DollarSign, color: "green", image: paymentReceivedLogo },
  "payment.failed": { icon: CreditCard, color: "red", severity: "critical" },
  "quota.exceeded": { icon: Gauge, color: "orange", severity: "critical" },
  "seo.audit.done": { icon: RefreshCw, color: "gray", image: seoAuditLogo },
  "seo.rank.changed": { icon: TrendingUp, color: "blue" },
  // The one failure invisible from the dashboard — see its spec on the server.
  "tracking.stopped": { icon: SatelliteDish, color: "red", severity: "critical" },
  "social.post.failed": { icon: SendHorizontal, color: "orange", severity: "warning" },
  "lead.captured": { icon: UserRoundCheck, color: "teal" },
  "admin.message": { icon: Megaphone, color: "indigo" },
  "security.alert": { icon: AlertTriangle, color: "red", severity: "critical" },
  "form.submission": { icon: Inbox, color: "teal", image: formSubmissionLogo },
};


export function showsAvatar(type: NotificationType): boolean {
  return type === "invite.received" || type === "invite.accepted";
}
