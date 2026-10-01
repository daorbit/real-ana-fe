const DAY_MS = 24 * 60 * 60 * 1000;

function monthDate(key: string): Date {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, 1));
}

export function monthLabel(key: string, style: "short" | "long" = "short"): string {
  return monthDate(key).toLocaleDateString(undefined, {
    month: style,
    year: "numeric",
    timeZone: "UTC",
  });
}

export function monthTick(key: string): string {
  return monthDate(key).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
}

export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS));
}

export function usageShare(used: number, quota: number): number {
  if (quota <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, (used / quota) * 100);
}

export type MeterState = "over" | "near" | undefined;

export function meterState(share: number): MeterState {
  if (share >= 100) return "over";
  if (share >= 80) return "near";
  return undefined;
}
