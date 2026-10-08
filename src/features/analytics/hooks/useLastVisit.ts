import { useEffect, useRef, useState } from "react";

const PREFIX = "quantalog.lastVisit";
const MIN_GAP_MS = 20 * 60 * 1000;

type Snapshot = { at: number; visitors: number; pageviews: number };

export type LastVisit = {
  at: Date;
  visitors: number | null;
  pageviews: number | null;
};

function read(key: string): Snapshot | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null");
    if (raw && typeof raw.at === "number" && typeof raw.visitors === "number" && typeof raw.pageviews === "number") {
      return raw as Snapshot;
    }
  } catch {
    return null;
  }
  return null;
}

function write(key: string, snap: Snapshot) {
  try {
    localStorage.setItem(key, JSON.stringify(snap));
  } catch {
    return;
  }
}

function change(now: number, before: number): number | null {
  if (before <= 0) return null;
  return Math.round(((now - before) / before) * 100);
}

export function useLastVisit(
  workspaceId: string | undefined,
  scopeKey: string,
  current: { visitors: number; pageviews: number } | null,
): LastVisit | null {
  const [last, setLast] = useState<LastVisit | null>(null);
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !current) return;
    const key = `${PREFIX}:${workspaceId}:${scopeKey}`;
    if (recorded.current === key) return;
    recorded.current = key;

    const prev = read(key);
    const now = Date.now();
    const stale = !prev || now - prev.at >= MIN_GAP_MS;

    setLast(
      prev && stale
        ? {
            at: new Date(prev.at),
            visitors: change(current.visitors, prev.visitors),
            pageviews: change(current.pageviews, prev.pageviews),
          }
        : null,
    );

    if (stale) write(key, { at: now, visitors: current.visitors, pageviews: current.pageviews });
  }, [workspaceId, scopeKey, current]);

  return last;
}
