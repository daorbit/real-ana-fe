import { useWorkspace } from "@/features/workspace/context";
import type { CustomLink, CustomLinkMode, NavPrefs } from "@/shared/types";

export type { CustomLink, CustomLinkMode, NavPrefs };
export type NavItemState = "pinned" | "shown" | "hidden";

export const EMPTY_NAV_PREFS: NavPrefs = { hidden: [], pinned: [], links: [] };
export const LOCKED_NAV_ITEMS = new Set(["/app", "/app/settings"]);
export const MAX_CUSTOM_LINKS = 10;

export function useNavPrefs(): NavPrefs {
  return useWorkspace().active?.navPrefs ?? EMPTY_NAV_PREFS;
}

export function navItemState(prefs: NavPrefs, to: string): NavItemState {
  if (prefs.pinned.includes(to)) return "pinned";
  if (prefs.hidden.includes(to)) return "hidden";
  return "shown";
}

export function withItemState(prefs: NavPrefs, to: string, state: NavItemState): NavPrefs {
  if (state === "hidden" && LOCKED_NAV_ITEMS.has(to)) return prefs;
  const hidden = prefs.hidden.filter((x) => x !== to);
  const pinned = prefs.pinned.filter((x) => x !== to);
  if (state === "hidden") hidden.push(to);
  if (state === "pinned") pinned.push(to);
  return { ...prefs, hidden, pinned };
}

const moveIn = <T,>(list: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export function withPinnedOrder(prefs: NavPrefs, from: number, to: number): NavPrefs {
  return { ...prefs, pinned: moveIn(prefs.pinned, from, to) };
}

export function withLinkOrder(prefs: NavPrefs, from: number, to: number): NavPrefs {
  return { ...prefs, links: moveIn(prefs.links, from, to) };
}

export function withLink(prefs: NavPrefs, link: CustomLink): NavPrefs {
  const exists = prefs.links.some((l) => l.id === link.id);
  if (!exists && prefs.links.length >= MAX_CUSTOM_LINKS) return prefs;
  return {
    ...prefs,
    links: exists ? prefs.links.map((l) => (l.id === link.id ? link : l)) : [...prefs.links, link],
  };
}

export function withoutLink(prefs: NavPrefs, id: string): NavPrefs {
  return { ...prefs, links: prefs.links.filter((l) => l.id !== id) };
}

export function withDefaultPages(prefs: NavPrefs): NavPrefs {
  return { ...prefs, hidden: [], pinned: [] };
}

export const LINK_ROUTE = "/app/link";

export function linkPath(slug: string): string {
  return `${LINK_ROUTE}/${slug}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function newLinkId(): string {
  return `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
