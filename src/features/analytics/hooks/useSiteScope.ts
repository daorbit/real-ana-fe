import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "rta_site_scope";

/** The whole map, keyed by workspace id. Bad JSON reads as "nothing saved". */
function readAll(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * The site picker's selection, remembered per workspace.
 *
 * Kept out of the pages so Home and Analytics agree on the scope rather than
 * each holding their own copy — narrowing to one site on Analytics and
 * finding Home back on "all sites" is the kind of disagreement that makes
 * someone distrust both numbers.
 *
 * Keyed by workspace because a siteId only means anything inside the
 * workspace that owns it; carrying one across would silently filter to
 * nothing. Stored as "all" (an empty list) by default, matching how the
 * filter is sent to the API.
 */
/** The saved selection for a workspace, or "all sites" when there is none. */
function savedScope(workspaceId: string | undefined): string[] {
  if (!workspaceId) return [];
  const saved = readAll()[workspaceId];
  return Array.isArray(saved) ? saved : [];
}

export function useSiteScope(workspaceId: string | undefined) {
  // Resolved during the first render, not in an effect after it. Loading it
  // afterwards meant every mount went "all sites" -> saved selection, which
  // the pages read as a scope *change* and answered with the switch overlay —
  // so a route change back to Home replayed the loading screen even for a
  // workspace with a single site.
  const [scope, setScope] = useState<string[]>(() => savedScope(workspaceId));
  const loadedFor = useRef(workspaceId);

  // Switching workspace still has to swap the selection rather than keep the
  // previous one — but only on an actual change, which the ref makes
  // distinguishable from the initial render the state above already covered.
  useEffect(() => {
    if (loadedFor.current === workspaceId) return;
    loadedFor.current = workspaceId;
    setScope(savedScope(workspaceId));
  }, [workspaceId]);

  const update = useCallback(
    (next: string[]) => {
      setScope(next);
      if (!workspaceId) return;
      try {
        const all = readAll();
        // "All sites" is the default, so it is stored as an absence rather
        // than as an empty array — that keeps the map from growing an entry
        // for every workspace merely visited.
        if (next.length) all[workspaceId] = next;
        else delete all[workspaceId];
        localStorage.setItem(KEY, JSON.stringify(all));
      } catch {
        // Storage disabled or full — the selection still works for this
        // session, it just will not survive a reload.
      }
    },
    [workspaceId],
  );

  return [scope, update] as const;
}
