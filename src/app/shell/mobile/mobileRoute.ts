import { ADMIN_ITEMS, NAV_GROUPS, type NavItem } from "../navItems";

const PARENTS: NavItem[] = [...NAV_GROUPS.flatMap((group) => group.items), ...ADMIN_ITEMS]
  .filter((item) => item.to !== "/app")
  .sort((a, b) => b.to.length - a.to.length);

const SECTIONED = ["/app/settings", "/app/admin-tools"];

const isSection = (pathname: string) =>
  SECTIONED.some(
    (base) => pathname.startsWith(`${base}/`) && !pathname.slice(base.length + 1).includes("/"),
  );

export function detailParent(pathname: string): NavItem | undefined {
  if (isSection(pathname)) return undefined;
  return PARENTS.find((item) => pathname.startsWith(`${item.to}/`));
}
