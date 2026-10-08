import { Link2 } from "lucide-react";
import type { NavGroup, NavItem } from "./navItems";
import { linkPath, type NavPrefs } from "./navPrefs";

export const PINNED_HEADING_KEY = "nav.groupPinned";
export const LINKS_HEADING_KEY = "nav.groupLinks";

export function applyNavPrefs(groups: NavGroup[], prefs: NavPrefs): NavGroup[] {
  if (prefs.hidden.length === 0 && prefs.pinned.length === 0 && prefs.links.length === 0) return groups;

  const hidden = new Set(prefs.hidden);
  const pinnedSet = new Set(prefs.pinned);
  const byPath = new Map<string, NavItem>(groups.flatMap((g) => g.items.map((i) => [i.to, i] as const)));

  const pinnedItems = prefs.pinned
    .map((to) => byPath.get(to))
    .filter((i): i is NavItem => Boolean(i));

  const linkItems: NavItem[] = prefs.links.map((l) => {
    const internal = l.mode === "internal" && Boolean(l.slug);
    return {
      to: internal ? linkPath(l.slug) : l.url,
      labelKey: "",
      label: l.label,
      icon: Link2,
      external: !internal,
      linkUrl: l.url,
      logoUrl: l.logoUrl,
    };
  });

  const rest = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !hidden.has(i.to) && !pinnedSet.has(i.to)) }))
    .filter((g) => g.items.length > 0);

  return [
    ...(pinnedItems.length ? [{ headingKey: PINNED_HEADING_KEY, heading: "Pinned", items: pinnedItems }] : []),
    ...(linkItems.length ? [{ headingKey: LINKS_HEADING_KEY, heading: "Links", items: linkItems }] : []),
    ...rest,
  ];
}
