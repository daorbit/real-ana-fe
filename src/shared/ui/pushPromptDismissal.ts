const STORE_KEY = "quantalog:push-prompt-dismissed";

export type PushDismissal = { until: number };

export function readPushDismissal(): PushDismissal | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PushDismissal>;
    if (typeof parsed?.until !== "number") return null;
    return { until: parsed.until };
  } catch {
    return null;
  }
}

export function writePushDismissal(d: PushDismissal): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    return;
  }
}
