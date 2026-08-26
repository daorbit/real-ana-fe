import { useCallback, useEffect, useState } from "react";

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
export function useSiteScope(workspaceId: string | undefined) {
  const [scope, setScope] = useState<string[]>([]);

  // Load on workspace change rather than once on mount: switching workspace
  // has to swap the selection, not keep the previous one.
  useEffect(() => {
    if (!workspaceId) return setScope([]);
    const saved = readAll()[workspaceId];
    setScope(Array.isArray(saved) ? saved : []);
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
