import {
  AlertTriangle,
  DollarSign,
  CalendarClock,
  FileText,
  RefreshCw,
  Megaphone,
  UserPlus,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/shared/types";
import formSubmissionLogo from "@/assets/banners/notications-logos/form-submissions.png";
import paymentReceivedLogo from "@/assets/banners/notications-logos/payments-and-receipts.png";
import reportReadyLogo from "@/assets/banners/notications-logos/scheduled-reports.png";
import seoAuditLogo from "@/assets/banners/notications-logos/seo-audits.png";


export type NotificationVisual = {
  icon: LucideIcon;
  /** A Mantine palette name, used for the icon and its wash. */
  color: string;

  image?: string;
};

export const NOTIFICATION_VISUALS: Record<NotificationType, NotificationVisual> = {
  "invite.received": { icon: UserPlus, color: "violet" },
  "invite.accepted": { icon: UserPlus, color: "teal" },
  "report.ready": { icon: FileText, color: "gray", image: reportReadyLogo },
  "plan.ending": { icon: CalendarClock, color: "orange" },
  "payment.received": { icon: DollarSign, color: "green", image: paymentReceivedLogo },
  "seo.audit.done": { icon: RefreshCw, color: "gray", image: seoAuditLogo },
  "admin.message": { icon: Megaphone, color: "indigo" },
  "security.alert": { icon: AlertTriangle, color: "red" },
  "form.submission": { icon: Inbox, color: "teal", image: formSubmissionLogo },
};


export function showsAvatar(type: NotificationType): boolean {
  return type === "invite.received" || type === "invite.accepted";
}
