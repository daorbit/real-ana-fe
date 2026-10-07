const KEY = "quantalog_pending_ref";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function storePendingRef(raw: string | null) {
  const code = String(raw ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 32);
  if (!code) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    return;
  }
}

export function readPendingRef(): string | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code?: string; at?: number } | null;
    if (!parsed?.code || !parsed.at || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed.code;
  } catch {
    return null;
  }
}

export function clearPendingRef() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}

export function referralLink(code: string): string {
  return `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`;
}
