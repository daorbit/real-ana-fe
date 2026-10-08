import type { NavGroup, NavItem } from "./navItems";
import type { NavPrefs } from "./navPrefs";

export const PINNED_HEADING_KEY = "nav.groupPinned";

export function applyNavPrefs(groups: NavGroup[], prefs: NavPrefs): NavGroup[] {
  if (prefs.hidden.length === 0 && prefs.pinned.length === 0) return groups;

  const hidden = new Set(prefs.hidden);
  const pinnedSet = new Set(prefs.pinned);
  const byPath = new Map<string, NavItem>(groups.flatMap((g) => g.items.map((i) => [i.to, i] as const)));

  const pinnedItems = prefs.pinned
    .map((to) => byPath.get(to))
    .filter((i): i is NavItem => Boolean(i));

  const rest = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !hidden.has(i.to) && !pinnedSet.has(i.to)) }))
    .filter((g) => g.items.length > 0);

  if (pinnedItems.length === 0) return rest;

  return [{ headingKey: PINNED_HEADING_KEY, heading: "Pinned", items: pinnedItems }, ...rest];
}
