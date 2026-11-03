import { sessionId } from "@/shared/lib/sessionHint";

const STORE_KEY = "quantalog:push-synced";
const RESYNC_MS = 24 * 60 * 60 * 1000;

type SyncMark = { key: string; at: number };

function readMark(): Partial<SyncMark> | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SyncMark>) : null;
  } catch {
    return null;
  }
}

export function pushSyncKey(userId: string | undefined, endpoint: string): string {
  return `${userId ?? ""}:${sessionId()}:${endpoint}`;
}

export function pushSyncOwner(): string | null {
  const key = readMark()?.key;
  return typeof key === "string" ? key.split(":")[0] || null : null;
}

export function needsPushSync(key: string): boolean {
  const mark = readMark();
  return !(mark?.key === key && typeof mark.at === "number" && Date.now() - mark.at < RESYNC_MS);
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
