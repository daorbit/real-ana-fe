import i18n from "@/lib/i18n/locale/i18n";
import type { ReportSchedule, ReportFrequency } from "@/shared/types";

/**
 * Labels resolve through i18n at call time rather than being module-level
 * constants, so a language change re-renders them instead of leaving whichever
 * language was active when the module first loaded.
 */
export function frequencyHint(f: ReportFrequency): string {
  return i18n.t(`reports.frequency${f[0].toUpperCase()}${f.slice(1)}Hint`);
}

export function frequencyLabel(f: ReportFrequency): string {
  return i18n.t(`reports.frequency${f[0].toUpperCase()}${f.slice(1)}`);
}

/** The order Next walks, and the order the tabs are shown in. */
export const TAB_ORDER: string[] = ["schedule", "delivery", "content"];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A short, absolute-ish description of when the next send lands. */
export function nextSendLabel(s: ReportSchedule): string {
  if (!s.enabled) return i18n.t("reports.paused");
  const when = new Date(s.nextRunAt);
  const days = Math.round((when.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return i18n.t("reports.today");
  if (days === 1) return i18n.t("reports.tomorrow");
  if (days < 7) return when.toLocaleDateString(i18n.language, { weekday: "long" });
  return when.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
}

/** Minimum gap between runs, matching the server's own floor. */
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * When a draft of this frequency would next fire.
 *
 * A deliberate port of the server's `computeNextRun` (08:00 UTC anchor, next
 * Monday for weekly, the 1st for monthly, a 24h floor on the result): a draft
 * has no `nextRunAt` until it is saved, and the preview claiming a different
 * time than the one the report actually arrives at is worse than showing none.
 * If the server's rule changes, this has to change with it.
 */
export function computeNextRun(f: ReportFrequency, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setUTCHours(8, 0, 0, 0);
  if (next <= from) next.setUTCDate(next.getUTCDate() + 1);

  if (f === "weekly") {
    const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
    next.setUTCDate(next.getUTCDate() + daysUntilMonday - 1);
  } else if (f === "monthly") {
    next.setUTCMonth(next.getUTCMonth() + 1, 1);
  }

  const earliest = new Date(from.getTime() + MIN_INTERVAL_MS);
  return next < earliest ? earliest : next;
}

/** "Mon 8 Sep, 13:30" in the viewer's own timezone — the anchor is 08:00 UTC,
 *  which is a different wall-clock time for whoever is reading it. */
export function nextRunLabel(f: ReportFrequency, from?: Date): string {
  return computeNextRun(f, from).toLocaleString(i18n.language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "3 emails · 1 WhatsApp · 1 opted out", counting only channels that are on. */
export function recipientSummary(s: ReportSchedule): string {
  const parts: string[] = [];
  if (s.channels.email) {
    const active = s.recipients.filter((r) => !r.unsubscribed).length;
    parts.push(i18n.t("reports.emailCount", { count: active }));
  }
  if (s.channels.whatsapp) {
    const active = s.phoneRecipients.filter((p) => !p.optedOut).length;
    parts.push(i18n.t("reports.whatsappCount", { count: active }));
  }
  const out =
    s.recipients.filter((r) => r.unsubscribed).length +
    s.phoneRecipients.filter((p) => p.optedOut).length;
  if (out) parts.push(i18n.t("reports.optedOutCount", { count: out }));
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
