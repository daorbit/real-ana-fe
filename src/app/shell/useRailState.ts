import { useCallback, useState } from "react";

/**
 * Where the rail's collapsed state is kept.
 *
 * In storage rather than in the URL or a context: it is a property of this
 * person at this desk, not of the page they are on, and it should survive a
 * reload the same way the colour scheme does.
 */
const RAIL_KEY = "nav:rail-collapsed";
const ADMIN_KEY = "nav:admin-open";

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "1";
  } catch {
    // Private modes and blocked storage throw on read. The rail is a
    // preference, not a feature — losing it is not worth a crash.
    return fallback;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch { /* see readFlag */ }
}

/** A boolean that remembers itself across reloads. */
function usePersistedFlag(key: string, fallback: boolean) {
  const [value, setValue] = useState(() => readFlag(key, fallback));
  const toggle = useCallback(() => {
    setValue((v) => {
      writeFlag(key, !v);
      return !v;
    });
  }, [key]);
  return [value, toggle] as const;
}

export function useRailState(mobile: boolean) {
  const [railCollapsed, toggleRail] = usePersistedFlag(RAIL_KEY, false);

  /**
   * Whether the Admin group is expanded. Closed by default — five rows an
   * admin needs rarely, sitting under the ones they use constantly.
   */
  const [adminOpen, toggleAdmin] = usePersistedFlag(ADMIN_KEY, false);

  /*
   * Desktop only. On a phone the navbar is already a slide-over that covers
   * the page — collapsing it there would leave a sliver of icons over the
   * content instead of getting out of the way, which is the opposite of what
   * the drawer is for.
   */
  return { collapsed: railCollapsed && !mobile, toggleRail, adminOpen, toggleAdmin };
}
