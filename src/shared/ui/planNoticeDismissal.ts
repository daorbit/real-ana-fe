const STORE_KEY = "quantalog:plan-notice-dismissed";

export type Dismissal = { key: string; until: number };

export function readDismissal(): Dismissal | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Dismissal>;
    if (typeof parsed?.key !== "string" || typeof parsed?.until !== "number") return null;
    return { key: parsed.key, until: parsed.until };
  } catch {
    return null;
  }
}

export function writeDismissal(d: Dismissal): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    return;
  }
}
