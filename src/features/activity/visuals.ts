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

/**
 * The icon and colour each notification type wears in the panel.
 *
 * A tinted chip per type rather than one grey icon throughout: the panel is
 * scanned, not read, and colour is what lets someone find the billing row in a
 * list of twenty without parsing any of the others. The colours are Mantine
 * palette names, so they resolve correctly in both themes.
 *
 * Kept deliberately small — four families, not eight. Red means "act on this or
 * something is wrong", amber means "a deadline is approaching", green means
 * money arrived, and blue-ish means routine. Eight distinct hues would be
 * decoration rather than signal.
 */
export type NotificationVisual = {
  icon: LucideIcon;
  /** A Mantine palette name, used for the icon and its wash. */
  color: string;
};

export const NOTIFICATION_VISUALS: Record<NotificationType, NotificationVisual> = {
  "invite.received": { icon: UserPlus, color: "violet" },
  "invite.accepted": { icon: UserPlus, color: "teal" },
  "report.ready": { icon: FileText, color: "gray" },
  "plan.ending": { icon: CalendarClock, color: "orange" },
  "payment.received": { icon: DollarSign, color: "green" },
  "seo.audit.done": { icon: RefreshCw, color: "gray" },
  "admin.message": { icon: Megaphone, color: "indigo" },
  "security.alert": { icon: AlertTriangle, color: "red" },
  "form.submission": { icon: Inbox, color: "teal" },
};

/**
 * Whether a row should show the actor's face rather than a type icon.
 *
 * Only where a person genuinely did the thing. A plan expiring is not somebody's
 * doing, and putting an avatar on it would imply a human made a decision about
 * this account.
 */
export function showsAvatar(type: NotificationType): boolean {
  return type === "invite.received" || type === "invite.accepted";
}
