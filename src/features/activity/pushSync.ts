const STORE_KEY = "quantalog:push-synced";
const RESYNC_MS = 24 * 60 * 60 * 1000;

type SyncMark = { key: string; at: number };

export function pushSyncKey(userId: string | undefined, endpoint: string): string {
  return `${userId ?? ""}:${endpoint}`;
}

export function needsPushSync(key: string): boolean {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const mark = raw ? (JSON.parse(raw) as Partial<SyncMark>) : null;
    return !(mark?.key === key && typeof mark.at === "number" && Date.now() - mark.at < RESYNC_MS);
  } catch {
    return true;
  }
}

export function markPushSynced(key: string): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ key, at: Date.now() } satisfies SyncMark));
  } catch {
    return;
  }
}

export function clearPushSync(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    return;
  }
}
