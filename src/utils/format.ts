/** Formatting helpers shared across the dashboard. */

/** 1234567 -> "1,234,567" */
export function num(n: number): string {
  return n.toLocaleString();
}

/** 1234567 -> "1.2M" — for tight spaces like stat cards. */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** ms -> "2m 14s" */
export function duration(ms: number): string {
  if (!ms || ms < 0) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** 0.42 -> "42%" (input is a ratio) */
export function ratio(v: number): string {
  return `${Math.round(v * 100)}%`;
}

/** Share of a total, as a percentage string. */
export function share(count: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

/** A Date -> "just now" / "42s ago" / "3m ago" / "2h ago" */
export function timeAgo(d: Date | string | null): string {
  if (!d) return "never";
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * The signed-in user's date preferences.
 *
 * Held at module scope rather than passed down: `shortDate` is called from
 * dozens of leaf components, and threading a prop through all of them to
 * change a date format is not worth the churn. `undefined` means "follow the
 * browser", which is also what these helpers did before the setting existed.
 */
let datePrefs: { locale?: string; timeZone?: string } = {};

/** Called once from the auth provider whenever the session's user changes. */
export function setDatePrefs(prefs: { locale?: string; timeZone?: string }) {
  datePrefs = {
    locale: prefs.locale || undefined,
    timeZone: prefs.timeZone || undefined,
  };
}

/** Locale-aware short date, e.g. "11 Jul 2026" */
export function shortDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(datePrefs.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: datePrefs.timeZone,
  });
}

/** Date and time in the user's locale/zone, e.g. "11 Jul 2026, 14:05" */
export function dateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(datePrefs.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: datePrefs.timeZone,
  });
}
