import { formatDate } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/types";

export type AuditDay = { key: string; label: string; entries: AuditEntry[] };

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return formatDate(d, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

export function groupByDay(entries: AuditEntry[]): AuditDay[] {
  const today = new Date();
  const days: AuditDay[] = [];
  for (const entry of entries) {
    const at = new Date(entry.createdAt);
    const key = dayKey(at);
    const last = days[days.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else days.push({ key, label: dayLabel(at, today), entries: [entry] });
  }
  return days;
}

export function timeOfDay(createdAt: string) {
  return formatDate(createdAt, { hour: "2-digit", minute: "2-digit" });
}
