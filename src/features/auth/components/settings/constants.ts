export const LOCALES = [
  { value: "", label: "Match my browser" },
  { value: "en-GB", label: "18 Jul 2026 · English (UK)" },
  { value: "en-US", label: "Jul 18, 2026 · English (US)" },
  { value: "en-IN", label: "18 Jul 2026 · English (India)" },
  { value: "de-DE", label: "18. Juli 2026 · German" },
  { value: "fr-FR", label: "18 juil. 2026 · French" },
  { value: "es-ES", label: "18 jul 2026 · Spanish" },
  { value: "ja-JP", label: "2026年7月18日 · Japanese" },
];

export const TIMEZONES = [
  { value: "", label: "Match my browser" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

export const BROWSER_LOCALE = (() => {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().locale || null;
  } catch {
    return null;
  }
})();

export const BROWSER_TZ = (() => {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
})();

export function mobileError(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^\+?[\d\s\-()]{6,20}$/.test(s)) return "settings.badPhone";
  return null;
}
