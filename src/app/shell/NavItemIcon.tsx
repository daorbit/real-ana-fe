import type { NavItem } from "./navItems";

export function navImage(item: Pick<NavItem, "app" | "art">): string | undefined {
  if (typeof item.app === "string") return `/apps/quantalog-${item.app}.svg`;
  if (item.art) return `/nav/${item.art}.svg`;
  return undefined;
}

export function NavItemIcon({ item, size }: { item: Pick<NavItem, "app" | "art" | "icon">; size: number }) {
  const image = navImage(item);
  if (image) return <img src={image} width={size} height={size} alt="" className="nav-app-logo" />;
  const Icon = item.icon;
  return <Icon size={size} />;
}
