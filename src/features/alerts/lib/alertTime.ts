const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayLabel(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function clockTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function groupByDay<T extends { createdAt: string }>(items: T[]): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const label = dayLabel(item.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export function nextCheckLabel(next: string | null): string {
  if (!next) return "paused";
  const minutes = Math.round((new Date(next).getTime() - Date.now()) / 60000);
  if (minutes <= 1) return "within minutes";
  if (minutes < 60) return `in ${minutes} min`;
  return `in ${Math.round(minutes / 60)} h`;
}
