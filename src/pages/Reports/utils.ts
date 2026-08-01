import type { ReportSchedule, ReportFrequency } from "../../types";

export const FREQUENCY_HINTS: Record<ReportFrequency, string> = {
  daily: "Every morning, covering the last 24 hours",
  weekly: "Monday mornings, covering the previous week",
  monthly: "The 1st of each month, covering the previous month",
};

export const FREQUENCY_LABEL: Record<ReportFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

/** The order Next walks, and the order the tabs are shown in. */
export const TAB_ORDER: string[] = ["schedule", "delivery", "content"];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A short, absolute-ish description of when the next send lands. */
export function nextSendLabel(s: ReportSchedule): string {
  if (!s.enabled) return "Paused";
  const when = new Date(s.nextRunAt);
  const days = Math.round((when.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return when.toLocaleDateString(undefined, { weekday: "long" });
  return when.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** "3 emails · 1 WhatsApp · 1 unsubscribed", counting only channels that are on. */
export function recipientSummary(s: ReportSchedule): string {
  const parts: string[] = [];
  if (s.channels.email) {
    const active = s.recipients.filter((r) => !r.unsubscribed).length;
    parts.push(`${active} email${active === 1 ? "" : "s"}`);
  }
  if (s.channels.whatsapp) {
    const active = s.phoneRecipients.filter((p) => !p.optedOut).length;
    parts.push(`${active} WhatsApp`);
  }
  const out =
    s.recipients.filter((r) => r.unsubscribed).length +
    s.phoneRecipients.filter((p) => p.optedOut).length;
  if (out) parts.push(`${out} opted out`);
  return parts.join(" · ");
}

/** The actual destinations, so an owner can confirm a report goes where they think. */
export function destinations(s: ReportSchedule): string {
  return [
    ...(s.channels.email ? s.recipients.filter((r) => !r.unsubscribed).map((r) => r.email) : []),
    ...(s.channels.whatsapp
      ? s.phoneRecipients.filter((p) => !p.optedOut).map((p) => p.label || `+${p.phone}`)
      : []),
  ].join(", ");
}
